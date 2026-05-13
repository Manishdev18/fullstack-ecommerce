import React from 'react';
import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Injects JSON-LD in the document head for rich results (Organization, Product, etc.). */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  </Helmet>
);
