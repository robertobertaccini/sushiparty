import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white text-sm font-medium backdrop-blur-sm"
      title={i18n.language === 'it' ? 'Switch to English' : 'Passa all\'Italiano'}
    >
      <Globe size={16} />
      <span>{i18n.language === 'it' ? 'EN' : 'IT'}</span>
    </button>
  );
}
