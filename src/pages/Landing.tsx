import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ShoppingBag, Home as HomeIcon, Calendar, X } from 'lucide-react';
import LocationDropdown from '../components/LocationDropdown';
import PublicCalendar from '../components/PublicCalendar';

export default function Landing() {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  const sushiGallery = [
    { name: "Temari Sushi", image: "/gallery/100-2000x1331-800x532.jpg" },
    { name: "Maki Sushi", image: "/gallery/100-1-2000x1500-800x600.jpg" },
    { name: "La Barca di Uramaki", image: "/gallery/2016-03-08-21-2000x1123-800x449.jpg" },
    { name: "Mr.Kappa Maki Sushi (VEG)", image: "/gallery/cimg0041-2000x1500-800x600.jpg" },
    { name: "Rainbow", image: "/gallery/12923109-10153511328643263-5362409893552790794-n-2000x2666-800x1066.jpg" },
    { name: "Oshi Sushi Unagi", image: "/gallery/wp-20160324-2000x3560-800x1424.jpg" },
    { name: "Onigiri", image: "/gallery/img-20150511-wa0001-2000x1500-800x600.jpg" }
  ];

  const [selectedSushi, setSelectedSushi] = useState(sushiGallery[0]);

  useEffect(() => {
    setSelectedSushi(sushiGallery[Math.floor(Math.random() * sushiGallery.length)]);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-red-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Diventa il cuoco del tuo SushiParty!</h1>
          <p className="text-xl md:text-2xl mb-8 font-light max-w-3xl mx-auto">
            Chi ama il sushi lo mangerebbe almeno una volta a settimana! Il sushi è un cibo buono, sano, leggero e anche facile da preparare. Perché non provare a farlo a casa?
          </p>
          <p className="text-lg mb-10 font-medium">
            SushiParty organizza serate a tema dove i cuochi siete voi, con l'assistenza di un SushiMan qualificato.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-8 py-3 bg-white text-red-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Inizia Ora
            </button>
          </div>
        </div>
      </section>

      {/* Come Funziona Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Come Funziona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 p-8 rounded-xl text-center border border-red-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-center mb-4">
                <HomeIcon size={48} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Dove si fa? A casa tua!</h3>
              <p className="text-gray-600">
                Non devi andare in posti lontani per mangiare del buon sushi. Stai comodo a casa tua ed invita qualche amico. Un SushiMan sarà a tua disposizione per tutto l'evento.
              </p>
            </div>
            <div className="bg-red-50 p-8 rounded-xl text-center border border-red-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-center mb-4">
                <ShoppingBag size={48} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Chi fa la spesa? SushiParty!</h3>
              <p className="text-gray-600">
                SushiParty si occupa di acquistare tutti gli ingredienti necessari alla preparazione del sushi. Tutti gli ingredienti vengono tagliati e preparati per consentire l'uso immediato.
              </p>
            </div>
            <div className="bg-red-50 p-8 rounded-xl text-center border border-red-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-center mb-4">
                <ChefHat size={48} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Chi prepara il sushi? Tu!</h3>
              <p className="text-gray-600">
                Nella prima parte dell'evento il SushiMan ti guida passo dopo passo partendo dai pezzi facili. Mentre si mangia il SushiMan prepara anche altri tipi di sushi a propria fantasia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Occasioni Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Le Occasioni Perfette</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Compleanno a Tema", subtitle: "Tanti sushi-auguri!", desc: "Una bella sorpresa per chi è sushi-addicted.", id: "compleanno-a-tema" },
              { title: "Festa a Tema", subtitle: "Dress-code Japan", desc: "Condividi la tua passione per il sushi e prova a creare il tuo sushi partendo dalle basi.", id: "festa-a-tema" },
              { title: "Team Building", subtitle: "Sushi-cucine da incubo", desc: "SushiParty vi catapulta nella catena di produzione del sushi. Quanti pezzi riuscirete a produrre?", id: "team-building" },
              { title: "Sushi Contest", subtitle: "Mamma guarda cosa ho imparato", desc: "Alla fine del corso gli allievi preparano il sushi per i propri amici e parenti.", id: "sushi-contest" }
            ].map((item, i) => (
              <Link to={`/occasions/${item.id}`} key={i} className="flex bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-red-300 transition-all cursor-pointer group">
                <div className="mr-4 mt-1"><Calendar className="text-red-500 group-hover:scale-110 transition-transform" size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition-colors">{item.title}</h3>
                  <h4 className="text-sm font-semibold text-red-600 mb-2">{item.subtitle}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Il nostro Sushi */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Il Nostro Sushi</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10">
            Tutte le foto sono reali, il sushi che vedi è stato fatto in casa. SushiParty porta tutti gli strumenti necessari comprese stuoiette, coltelli ed altri attrezzi che facilitano il lavoro.
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sushiGallery.map((sushi, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedSushi(sushi)}
                className={`border p-4 rounded-lg flex items-center justify-center text-center shadow-sm transition-all duration-300 ${
                  selectedSushi?.name === sushi.name 
                    ? 'bg-red-50 border-red-300 text-red-700 ring-2 ring-red-100 scale-[1.02]' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100 hover:scale-[1.02]'
                }`}
              >
                <span className="font-semibold">{sushi.name}</span>
              </button>
            ))}
          </div>

          {selectedSushi && (
            <div className="mt-8 flex justify-center animate-in fade-in zoom-in duration-500">
              <div className="max-w-4xl w-full bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
                <img 
                  src={selectedSushi.image} 
                  alt={selectedSushi.name} 
                  className="rounded-lg w-full max-h-[500px] object-cover transition-opacity duration-500"
                />
                <h3 className="mt-4 text-2xl font-bold text-gray-800">{selectedSushi.name}</h3>
              </div>
            </div>
          )}
          <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">Sushi Party è anche VEG!</h3>
            <p className="text-green-700">
              Si possono preparare deliziosi pezzi di sushi senza usare pesce o altri alimenti di origine animale. Mostriamo anche a chi non mangia pesce che può gustare il sushi in centinaia di ricette vegetariane.
            </p>
          </div>
        </div>
      </section>

      {/* Come si prepara */}
      <section className="py-16 px-4 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">I 5 Passi del SushiParty</h2>
          <div className="space-y-6">
            {[
              { title: "Stendi il riso", desc: "Prendi un'alga e crea uno strato di riso. Questa è la base del maki." },
              { title: "Scegli gli ingredienti", desc: "Combina come vuoi gli ingredienti ma fai attenzione a non riempire troppo il maki altrimenti non si chiude." },
              { title: "Arrotola", desc: "Il segreto per arrotolare bene è fare la giusta pressione evitando che gli ingredienti escano dai lati." },
              { title: "Taglia", desc: "Taglia il rotolo di sushi in 6 o 8 pezzi." },
              { title: "Impiatta", desc: "L'impiattamento valorizza il piatto ma quello che vi colpirà è il gusto." }
            ].map((step, i) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center font-bold text-xl mr-4">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                  <p className="text-red-100">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>Copyright © {new Date().getFullYear()} Roberto Bertaccini | SushiParty</p>
      </footer>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Verifica Disponibilità</h3>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona la tua città
                </label>
                <LocationDropdown
                  value={selectedCity}
                  onChange={setSelectedCity}
                  allowEmpty
                  emptyLabel="Scegli una città..."
                  className="w-full"
                />
              </div>

              {selectedCity ? (
                <PublicCalendar city={selectedCity} />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">Seleziona una città per visualizzare il calendario delle disponibilità.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Link
                to="/login"
                className="px-6 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
              >
                Prenota Ora
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
