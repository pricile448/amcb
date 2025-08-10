import { useParams } from 'react-router-dom';

export const useLanguageLink = () => {
  const { lang } = useParams<{ lang: string }>();
  
  const getLink = (path: string) => {
    if (!lang) return path;
    return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
  };
  
  const getDashboardLink = (path: string) => {
    if (!lang) return `/dashboard${path.startsWith('/') ? path : `/${path}`}`;
    return `/${lang}/dashboard${path.startsWith('/') ? path : `/${path}`}`;
  };
  
  return { getLink, getDashboardLink, currentLang: lang };
};
