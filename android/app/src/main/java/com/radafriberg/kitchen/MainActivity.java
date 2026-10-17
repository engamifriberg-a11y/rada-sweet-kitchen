package com.radafriberg.kitchen;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.OutputStream;

/**
 * מעטפת WebView ל"המטבח המתוק של ראדה".
 *
 * מעטפת תמימה הייתה שוברת שלוש יכולות שהאתר מסתמך עליהן, ולכן יש כאן גשרים:
 *   1. ייצוא גיבוי — האתר יוצר קובץ דרך blob:. WebView לא מוריד blob בעצמו,
 *      אז הקובץ נקרא ב־JS, מועבר לכאן כ־base64 ונשמר בתיקיית ההורדות.
 *   2. ייבוא גיבוי — בוחר קבצים דורש onShowFileChooser, אחרת כפתור הייבוא מת.
 *   3. הדפסה — window.print אינו קיים ב־WebView, אז הוא מנותב ל־PrintManager.
 *
 * בנוסף: קישורים חיצוניים (יוטיוב, גוגל) נפתחים בדפדפן ולא בתוך האפליקציה,
 * כפתור חזרה מנווט בהיסטוריה, ואין רשת → מסך הסבר בעברית.
 */
public class MainActivity extends AppCompatActivity {

    private static final String SITE = "https://rada-sweet-kitchen.vercel.app";

    private WebView web;
    private SwipeRefreshLayout refresh;
    private boolean loadFailed = false;
    private long lastBack = 0;
    private ValueCallback<Uri[]> filePicker;
    private ActivityResultLauncher<Intent> pickFile;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_main);

        refresh = findViewById(R.id.refresh);
        web = findViewById(R.id.web);

        pickFile = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (filePicker == null) return;
                    Uri[] uris = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        Uri single = result.getData().getData();
                        if (single != null) uris = new Uri[]{single};
                    }
                    filePicker.onReceiveValue(uris);
                    filePicker = null;
                });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);       // localStorage — כל העבודה של רדה
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);

        web.addJavascriptInterface(new Bridge(), "RadaNative");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                String host = u.getHost();
                if (host != null && host.endsWith("rada-sweet-kitchen.vercel.app")) return false;
                // יוטיוב, גוגל וכל השאר — בדפדפן, לא בתוך האפליקציה
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(MainActivity.this, R.string.no_browser, Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                refresh.setRefreshing(false);
                if (!loadFailed) injectBridges();
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) {
                    loadFailed = true;
                    v.loadUrl("file:///android_asset/offline.html");
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb,
                                             FileChooserParams params) {
                if (filePicker != null) filePicker.onReceiveValue(null);
                filePicker = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try {
                    pickFile.launch(Intent.createChooser(i, getString(R.string.pick_backup)));
                } catch (ActivityNotFoundException e) {
                    filePicker = null;
                    return false;
                }
                return true;
            }
        });

        // גיבוי שמורד ישירות (לא blob) — נשמר דרך הדפדפן
        web.setDownloadListener((url, ua, disposition, mime, size) -> {
            if (url.startsWith("blob:")) return; // מטופל בגשר
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (ActivityNotFoundException ignored) {
            }
        });

        refresh.setOnRefreshListener(() -> {
            loadFailed = false;
            web.loadUrl(SITE);
        });

        /*
         * כפתור החזרה הפיזי. בתוך האפליקציה הוא מנווט אחורה; בשורש הוא
         * לא סוגר מיד — לחיצה אחת בטעות אסור שתזרוק את רדה החוצה באמצע
         * מתכון. לחיצה שנייה תוך שתי שניות סוגרת.
         */
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (web.canGoBack()) {
                    web.goBack();
                    return;
                }
                long now = System.currentTimeMillis();
                if (now - lastBack < 2000) {
                    finishAndRemoveTask();
                    return;
                }
                lastBack = now;
                Toast.makeText(MainActivity.this, R.string.back_again, Toast.LENGTH_SHORT).show();
            }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl(SITE);
    }

    /**
     * מחליף את window.print ומיירט הורדות blob, כדי שכפתורי ההדפסה
     * והגיבוי באתר יעבדו גם בתוך האפליקציה.
     */
    private void injectBridges() {
        String js =
                "(function(){" +
                "  if (window.__radaBridged) return; window.__radaBridged = true;" +
                "  window.print = function(){ try { RadaNative.printPage(); } catch(e){} };" +
                "  var click = HTMLAnchorElement.prototype.click;" +
                "  HTMLAnchorElement.prototype.click = function(){" +
                "    var a = this;" +
                "    if (a.href && a.href.indexOf('blob:') === 0 && a.download) {" +
                "      fetch(a.href).then(function(r){ return r.blob(); }).then(function(b){" +
                "        var fr = new FileReader();" +
                "        fr.onloadend = function(){" +
                "          var s = String(fr.result); var i = s.indexOf(',');" +
                "          try { RadaNative.saveFile(a.download, s.slice(i+1)); } catch(e){}" +
                "        };" +
                "        fr.readAsDataURL(b);" +
                "      }).catch(function(){});" +
                "      return;" +
                "    }" +
                "    return click.apply(a, arguments);" +
                "  };" +
                "})();";
        web.evaluateJavascript(js, null);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    /**
     * כותב את העוגיות לדיסק. בלי זה "יציאה מלאה" באתר מוחקת את עוגיית
     * השער רק בזיכרון, והאפליקציה שנפתחת מחדש חוזרת ישר פנימה —
     * בדיוק מה שהיציאה הייתה אמורה למנוע.
     */
    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    public class Bridge {

        /** שומר את קובץ הגיבוי בתיקיית ההורדות */
        @JavascriptInterface
        public void saveFile(String name, String base64) {
            runOnUiThread(() -> {
                try {
                    byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                    String safe = (name == null || name.isEmpty()) ? "rada-backup.json" : name;

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.Downloads.DISPLAY_NAME, safe);
                        cv.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                        cv.put(MediaStore.Downloads.IS_PENDING, 1);
                        Uri uri = getContentResolver().insert(
                                MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                        if (uri == null) throw new Exception("no uri");
                        try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                            if (os == null) throw new Exception("no stream");
                            os.write(bytes);
                        }
                        cv.clear();
                        cv.put(MediaStore.Downloads.IS_PENDING, 0);
                        getContentResolver().update(uri, cv, null, null);
                    } else {
                        java.io.File dir = Environment.getExternalStoragePublicDirectory(
                                Environment.DIRECTORY_DOWNLOADS);
                        if (!dir.exists()) dir.mkdirs();
                        java.io.File f = new java.io.File(dir, safe);
                        try (java.io.FileOutputStream fos = new java.io.FileOutputStream(f)) {
                            fos.write(bytes);
                        }
                    }
                    Toast.makeText(MainActivity.this,
                            getString(R.string.saved_to_downloads, safe),
                            Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, R.string.save_failed, Toast.LENGTH_LONG).show();
                }
            });
        }

        /** מנתב את כפתורי ההדפסה אל מנהל ההדפסה של אנדרואיד */
        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> {
                try {
                    PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                    if (pm == null) return;
                    String job = getString(R.string.app_name);
                    pm.print(job,
                            web.createPrintDocumentAdapter(job),
                            new PrintAttributes.Builder().build());
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, R.string.print_failed, Toast.LENGTH_SHORT).show();
                }
            });
        }

        /**
         * נקרא אחרי "יציאה מלאה" באתר. השרת כבר מחק את העוגיות, וכאן
         * רק מוודאים שהמחיקה נכתבת לדיסק מיד ולא רק כשהאפליקציה נעצרת.
         */
        @JavascriptInterface
        public void sessionCleared() {
            runOnUiThread(() -> CookieManager.getInstance().flush());
        }

        /** כפתור "סגירת האפליקציה" באתר */
        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(() -> finishAndRemoveTask());
        }

        /** כפתור "המסך הראשי" — נשאר בתוך האפליקציה */
        @JavascriptInterface
        public void goHome() {
            runOnUiThread(() -> {
                loadFailed = false;
                web.loadUrl(SITE);
            });
        }

        /** נקרא מדף הלא־מקוון */
        @JavascriptInterface
        public void retry() {
            runOnUiThread(() -> {
                loadFailed = false;
                web.loadUrl(SITE);
            });
        }
    }
}
