type WebsiteInput = {
  url: string;
  name: string;
  description: string;
};

type OrganizationInput = {
  url: string;
  name: string;
  logoUrl: string;
};

export function buildWebsiteSchema(input: WebsiteInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: input.url,
    description: input.description,
  };
}

export function buildOrganizationSchema(input: OrganizationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: input.url,
    logo: input.logoUrl,
  };
}

