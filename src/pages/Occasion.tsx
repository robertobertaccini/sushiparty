import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const occasionsData: Record<string, { title: string; subtitle: string; desc: string; longDesc: string; image: string }> = {
  'compleanno-a-tema': {
    title: "Compleanno a Tema",
    subtitle: "Tanti sushi-auguri!",
    desc: "Una bella sorpresa per chi è sushi-addicted.",
    longDesc: "Sorprendi i tuoi amici e rendi il tuo compleanno indimenticabile! Un'esperienza unica in cui festeggiare circondati da riso, pesce fresco e allegria. Crea i tuoi maki preferiti e brinda al tuo giorno speciale con un tocco giapponese. Perfetto per gli amanti del sushi di tutte le età.",
    image: "/images/events/birthday_sushi.png"
  },
  'festa-a-tema': {
    title: "Festa a Tema",
    subtitle: "Dress-code Japan",
    desc: "Condividi la tua passione per il sushi e prova a creare il tuo sushi partendo dalle basi.",
    longDesc: "Immergiti nell'atmosfera del Giappone! Che sia una serata tra amici o un incontro informale, vestitevi a tema e scoprite i segreti della preparazione del sushi. Il nostro SushiMan vi guiderà dai primi passi fino alla creazione di piatti deliziosi in un ambiente divertente e rilassato.",
    image: "/images/events/theme_party_sushi.png"
  },
  'team-building': {
    title: "Team Building",
    subtitle: "Sushi-cucine da incubo",
    desc: "SushiParty vi catapulta nella catena di produzione del sushi. Quanti pezzi riuscirete a produrre?",
    longDesc: "Invita i tuoi colleghi che amano il sushi a un'appassionante sfida ai fornelli! Il nostro format per le aziende trasforma la cucina in una vera e propria catena di produzione del sushi maki. La collaborazione, la coordinazione e lo spirito di squadra saranno fondamentali per vincere la sfida. Un modo perfetto per consolidare il gruppo e rafforzare le relazioni aziendali in modo gustoso e divertente.",
    image: "/images/events/team_building_sushi.png"
  },
  'sushi-contest': {
    title: "Sushi Contest",
    subtitle: "Mamma guarda cosa ho imparato",
    desc: "Alla fine del corso gli allievi preparano il sushi per i propri amici e parenti.",
    longDesc: "Una vera e propria competizione culinaria amichevole! Dopo aver appreso le tecniche di base dal nostro SushiMan, mettetevi alla prova creando composizioni originali. Chi preparerà il piatto più bello e buono? I vostri amici e parenti faranno da giudici per incoronare il campione della serata.",
    image: "/images/events/sushi_contest.png"
  }
};

export default function Occasion() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  
  if (!id || !occasionsData[id]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('occasion.notFound')}</h1>
          <Link to="/" className="text-red-600 hover:underline">{t('occasion.backToHome')}</Link>
        </div>
      </div>
    );
  }

  const occasion = occasionsData[id];

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-red-600 hover:text-red-700 font-medium mb-8">
          <ArrowLeft className="mr-2" size={20} />
          {t('occasion.back')}
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="w-full h-64 md:h-96 relative">
            <img 
              src={occasion.image} 
              alt={occasion.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                {id === 'compleanno-a-tema' ? t('landing.occasions.compleanno.title') : 
                 id === 'festa-a-tema' ? t('landing.occasions.festa.title') : 
                 id === 'team-building' ? t('landing.occasions.teambuilding.title') : 
                 t('landing.occasions.contest.title')}
              </h1>
              <p className="text-xl text-red-100 font-semibold">
                {id === 'compleanno-a-tema' ? t('landing.occasions.compleanno.subtitle') : 
                 id === 'festa-a-tema' ? t('landing.occasions.festa.subtitle') : 
                 id === 'team-building' ? t('landing.occasions.teambuilding.subtitle') : 
                 t('landing.occasions.contest.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <p className="text-gray-600 text-xl font-medium mb-8 leading-relaxed italic border-l-4 border-red-500 pl-4">
              "{id === 'compleanno-a-tema' ? t('landing.occasions.compleanno.desc') : 
                id === 'festa-a-tema' ? t('landing.occasions.festa.desc') : 
                id === 'team-building' ? t('landing.occasions.teambuilding.desc') : 
                t('landing.occasions.contest.desc')}"
            </p>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p className="leading-relaxed">
                {t(`occasion.items.${id}.longDesc`)}
              </p>
            </div>
            
            <div className="mt-12 text-center">
              <Link 
                to="/login"
                className="inline-block bg-red-600 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-red-700 transition shadow-lg hover:shadow-xl"
              >
                {t('occasion.bookNow')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
