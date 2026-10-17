# אפליקציית האנדרואיד

מעטפת דקה סביב `https://rada-sweet-kitchen.vercel.app`. היא קיימת כדי שלרדה יהיה
אייקון במסך הבית, בלי שורת כתובת, עם הורדת גיבוי והדפסה שעובדות — שלושה דברים
ש־WebView תמים שובר.

את קובץ ההתקנה המוכן אפשר להוריד מתוך האתר: תפריט החשבון ← **הורדת האפליקציה**.
מה שלמטה נועד למי שרוצה לבנות אותו מחדש.

## מה צריך

* JDK 17
* Android SDK עם `platforms;android-34` ו־`build-tools;34.0.0`
* Gradle 8.9 ומעלה

## בנייה

```bash
cd android
echo "sdk.dir=$ANDROID_HOME" > local.properties
gradle assembleRelease
```

התוצאה: `app/build/outputs/apk/release/app-release.apk`.

> אין `gradlew` במאגר, כי קובץ ה־JAR של העוטף הוא בינארי ואין סיבה להחזיק אותו כאן.
> מי שרוצה אותו מריץ `gradle wrapper` פעם אחת, והוא נוצר לפי
> `gradle/wrapper/gradle-wrapper.properties` שכבר קיים.

## חתימה

בלי מפתח, `assembleRelease` מפיק APK **לא חתום** שאנדרואיד יסרב להתקין.
המפתח לא נמצא במאגר — המאגר ציבורי, ומפתח שדלף מאפשר לכל אחד לפרסם
עדכון מזויף לאפליקציה.

ליצירת מפתח חדש:

```bash
keytool -genkeypair -v -keystore rada-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias rada
```

ואז `android/keystore.properties` (הקובץ ב־`.gitignore`):

```properties
storeFile=rada-release.jks
storePassword=…
keyAlias=rada
keyPassword=…
```

**שמרי את הקובץ ואת הסיסמה.** אנדרואיד מתקין עדכון רק כשהוא חתום באותו
מפתח כמו הגרסה הקודמת. מפתח שאבד פירושו שצריך להסיר את האפליקציה
ולהתקין מחדש — והנתונים נשמרים בחשבון בשרת, אז הם לא ילכו לאיבוד,
אבל זו עדיין הטרדה מיותרת.

## העלאת גרסה חדשה

1. להעלות את `versionCode` ו־`versionName` ב־`app/build.gradle`.
2. לבנות ולחתום.
3. להעלות את הקובץ לאחסון ה־Blob הפרטי של הפרויקט, ולעדכן באתר את משתני הסביבה
   `APK_VERSION`, `APK_SIZE`, `APK_PATH` ו־`APK_UPDATED`.

הנתיב `/api/apk` באתר קורא את המשתנים האלה, כך שאפשר לפרסם גרסה חדשה
בלי לפרוס מחדש את האתר.
