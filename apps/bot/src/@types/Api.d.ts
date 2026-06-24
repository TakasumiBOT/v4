type NslookupResponse = {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: {
    name: string;
    type: number;
  }[];
  Answer?: {
    name: string;
    typr: number;
    TTL: number;
    data: string;
  }[];
  Authority?: {
    name: string;
    typr: number;
    TTL: number;
    data: string;
  }[];
};

type GifMediaObject = {
  url: string;
  dims: number[];
  duration: number;
  size: number;
};

type GifResultObject = {
  created: number;
  hasaudio: boolean;
  id: string;
  tags: string[];
  title: string;
  content_description: string;
  itemurl: string;
  hascaption: boolean;
  flags: string;
  bg_color: string;
  url: string;
  media_formats: {
    [key: string]: GifMediaObject;
  };
};

type GifResponse = {
  next: string;
  results: GifResultObject[];
};

type IpResponse = {
  ip: string;
  country_code: string;
  country_name: string;
  region_name: string;
  city_name: string;
  latitude: number;
  longitude: number;
  zip_code: string;
  time_zone: string;
  asn: string;
  as: string;
  is_proxy: boolean;
  message: string;
};

type QrReadResponse = {
  type: string;
  symbol: {
    seq: number;
    data: string | null;
    error: string | null;
  }[];
};

type WikiResponse = {
  titles: {
    canonical: string;
    normalized: string;
    display: string;
  };
  pageid: number;
  extract: string;
  extract_html: string;
  thumbnail: {
    source: string;
    width: number;
    height: number;
  };
  originalimage: {
    source: string;
    width: number;
    height: number;
  };
  lang: string;
  dir: string;
  timestamp: string;
  description: string;
  coordinates: {
    lat: number;
    lon: number;
  };
};

type TranslateResponse = {
  sentences: {
    trans: string;
    orig: string;
    backend: number;
  }[];
  src: string;
  confidence: number;
};

type npmPackageResponse = {
  total: number;
  results: {
    package: {
      name: string;
      scope: string;
      version: string;
      description: string;
      keywords: string[];
      date: string;
      links: {
        npm: string;
        homepage: string;
        repository: string;
        bugs: string;
      };
      author: {
        name: string;
        email: string;
      };
      publisher: {
        username: string;
        email: string;
      };
      maintainers: {
        username: string;
        email: string;
      }[];
    };
    score: {
      final: number;
      detail: {
        quality: number;
        popularity: number;
        maintenance: number;
      };
    };
    searchScore: number;
  }[];
};

type PypiPackageResponse = {
  info: {
    author: string;
    author_email: string | null;
    bugtrack_url: string | null;
    classifiers: string[];
    description: string;
    description_content_type: string;
    docs_url: null;
    download_url: null;
    downloads: {
      last_day: number;
      last_month: number;
      last_week: number;
    };
    dynamic: string | null;
    home_page: string | null;
    keywords: string | null;
    license: string;
    license_expression: string | null;
    license_files: string | null;
    maintainer: string | null;
    name: string;
    package_url: string;
    platform: null;
    project_url: string;
    project_urls: {
      documentation: string;
      download: string;
      homepage: string;
      source: string;
      tracker: string;
    };
    provides_extra: string | null;
    release_url: string;
    requires_dist: string | null;
    requires_python: string;
    summary: string;
    version: string;
    yanked: boolean;
    yanked_reason: string | null;
  };
};

type ScriptResponse = {
  name: string;
  version: string;
  language: string;
};

type MathResponse = {
  expression: string;
  status: number;
  message: string;
  count: number;
  value: {
    calculatedvalue: string;
  }[];
};

type MCServerResponse = {
  ip: string;
  port: number;
  debug: {
    ping: boolean;
    query: boolean;
    bedrock: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachehit: boolean;
    cachetime: number;
    cacheexpire: number;
    apiversion: number;
    dns: {
      srv: {
        name: string;
        type: string;
        class: string;
        ttl: number;
        rdlength: number;
        rdata: string;
        priority: number;
        weight: number;
        port: number;
        target: string;
      }[];
      srv_a: {
        name: string;
        type: string;
        class: string;
        ttl: number;
        rdlength: number;
        rdata: string;
        cname: string;
      }[];
    };
    error: {
      query: string;
    };
  };
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  players: {
    online: number;
    max: number;
  };
  version: string;
  online: boolean;
  protocol: number;
  protocol_name: string;
  hostname: string;
  icon: string;
  software: string;
  info: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  eula_blocked: boolean;
};

type SafewebResponse = {
  id: string;
  url: string;
  rating: string;
  categories: number[];
  communityRating: number;
  reviewCount: number;
  userRating: number;
  globalRestriction: boolean;
};

export {
  NslookupResponse,
  GifResponse,
  IpResponse,
  QrReadResponse,
  WikiResponse,
  TranslateResponse,
  npmPackageResponse,
  PypiPackageResponse,
  ScriptResponse,
  MathResponse,
  MCServerResponse,
  SafewebResponse,
};
