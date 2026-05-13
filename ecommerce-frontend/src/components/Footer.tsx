import React from 'react';
import { Link } from 'react-router-dom';
import { useRootCategories } from '../hooks/useRootCategories';

const Footer: React.FC = () => {
  const { catalogSentence, isLoading } = useRootCategories(60_000);

  const catalogBlurb = isLoading
    ? 'Loading catalog…'
    : catalogSentence
      ? `${catalogSentence}. Quality you can trace, pricing you can read, and service you can count on.`
      : 'PiOra — add root categories in your catalog to describe your range here.';

  return (
    <footer className="border-t border-piora-border bg-piora-cream py-10 text-piora-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-bold text-piora-forest">PiOra</h3>
            <p className="mt-2 text-sm text-piora-forest/85">{catalogBlurb}</p>
          </div>

          <div>
            <h4 className="font-semibold text-piora-forest">Quick links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-piora-forest/80 hover:text-piora-leaf">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-piora-forest/80 hover:text-piora-leaf">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-piora-forest/80 hover:text-piora-leaf">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-piora-forest/80 hover:text-piora-leaf">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-piora-forest">Customer service</h4>
            <ul className="mt-3 space-y-2 text-sm text-piora-forest/80">
              <li>Contact us</li>
              <li>FAQ</li>
              <li>Shipping</li>
              <li>Returns</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-piora-forest">Contact</h4>
            <div className="mt-3 space-y-2 text-sm text-piora-forest/80">
              <p>Email: support@piora.example</p>
              <p>We reply during business hours.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-piora-border/80 pt-6 text-center text-sm text-piora-forest/70">
          <p>&copy; {new Date().getFullYear()} PiOra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
