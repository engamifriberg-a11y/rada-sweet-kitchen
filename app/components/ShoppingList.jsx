'use client';

import { useMemo, useState } from 'react';
import Icon from './Icon';
import { buildShoppingList, shoppingListText } from '../lib/library';

export default function ShoppingList({ lib, onClose, onOpenRecipe }) {
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const list = useMemo(() => buildShoppingList(lib.data.cart, lib.library), [lib.data.cart, lib.library]);

  const recipesInCart = lib.data.cart
    .map((c) => ({ entry: c, recipe: lib.library.find((r) => r.id === c.id) }))
    .filter((x) => x.recipe);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shoppingListText(list));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-in">
        <div className="sheet-bar">
          <button className="iconbtn" onClick={onClose} aria-label="סגירה">
            <Icon name="close" />
          </button>
          <b>רשימת קניות</b>
          {list.items.length > 0 && (
            <button className="iconbtn" onClick={copy} aria-label="העתקה">
              <Icon name="list" />
            </button>
          )}
        </div>

        <div className="block" style={{ marginTop: 20 }}>
          {recipesInCart.length === 0 ? (
            <p className="results-note">
              <Icon name="list" size={19} className="ri" />
              <span>
                הרשימה ריקה. פתחי מתכון, כווני את כמות המנות, ולחצי על <b>הוספה לרשימת הקניות</b>.
                אפשר להוסיף כמה מתכונים — מרכיבים זהים יתאחדו ויסוכמו.
              </span>
            </p>
          ) : (
            <>
              <div className="cart-recipes">
                {recipesInCart.map(({ entry, recipe }) => (
                  <div className="cart-chip" key={entry.id}>
                    <button className="cart-chip-main" onClick={() => onOpenRecipe(recipe.id)}>
                      <b>{recipe.title}</b>
                      <span>{entry.servings} מנות</span>
                    </button>
                    <button
                      className="rowdel"
                      onClick={() => lib.removeFromCart(entry.id)}
                      aria-label="הסרה"
                    >
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="block-h" style={{ marginTop: 26 }}>
                <span className="bh-icon">
                  <Icon name="list" />
                </span>
                <h3>לקנות</h3>
                <span className="k">{list.items.length} שורות</span>
              </div>

              <ul className="shop">
                {list.items.map((it, i) => (
                  <li
                    key={i}
                    className={done.includes(i) ? 'done' : ''}
                    onClick={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
                  >
                    <span className="tick">{done.includes(i) ? '✓' : ''}</span>
                    <span className="shop-q">
                      {Math.round(it.q * 10) / 10} {it.u}
                    </span>
                    <span className="shop-n">
                      {it.n}
                      {it.from.length > 1 && <span className="shop-from">{it.from.join(' · ')}</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="cta-row" style={{ padding: 0, marginTop: 20 }}>
                <button className="btn btn-primary" onClick={copy}>
                  <Icon name="list" size={18} />
                  {copied ? 'הועתק' : 'העתקת הרשימה'}
                </button>
                <button className="btn btn-ghost" onClick={() => window.print()}>
                  <Icon name="print" size={18} />
                  הדפסה
                </button>
                <button className="btn btn-ghost" onClick={() => lib.clearCart()}>
                  <Icon name="close" size={18} />
                  ניקוי
                </button>
              </div>
            </>
          )}
        </div>
        <div className="sheet-end" />
      </div>
    </div>
  );
}
