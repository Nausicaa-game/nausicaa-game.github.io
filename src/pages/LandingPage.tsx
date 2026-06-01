import { useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import WobbleCorner from '../components/WobbleCorner'
import type { WobbleHandle } from '../components/WobbleCorner'
import '../css/style.css'
import '../css/fonts.css'

export default function LandingPage() {
  const wobbleRef = useRef<WobbleHandle>(null)
  const navigate = useNavigate()

  const handlePlay = useCallback(() => {
    wobbleRef.current?.expand()
  }, [])

  const onExpandComplete = useCallback(() => {
    navigate('/app?animation=true')
  }, [navigate])

  return (
    <>
      <WobbleCorner ref={wobbleRef} onExpandComplete={onExpandComplete} />
      <header>
        <div className="logo-container">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div
              className="logo"
              style={{
                background: "url('/assets/icon.png'),beige",
                width: 48,
                height: 48,
                backgroundSize: 'contain',
                borderRadius: '50%',
              }}
            />
            <h1 style={{ position: 'relative', left: 8, top: -4 }}>Nausicaa</h1>
          </div>
          <p className="tagline">Stratégie mythologique sur plateau</p>
        </div>
        <nav>
          <ul>
            <li><a href="#accueil" className="active">Accueil</a></li>
            <li><a href="#how-to-play">Règles</a></li>
            <li><a href="#units-types">Unités</a></li>
            <li><a href="#newsletter">Contact</a></li>
          </ul>
        </nav>
        <div className="language-selector">
          <select id="language-selector">
            <option value="fr" selected>Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </header>

      <main>
        <section id="hero">
          <div className="hero-content">
            <h2>L'univers stratégique de Nausicaa</h2>
            <p>Un jeu de plateau mythologique où construction de deck et tactique s'entremêlent</p>
            <div className="cta-buttons">
              <button onClick={handlePlay} className="btn primary">JOUER</button>
              <a href="/demo" className="btn secondary">DIDACTICIEL</a>
            </div>
          </div>
          <div className="hero-cards">
            <div className="card card1" />
            <div className="card card2" />
            <div className="card card3" />
          </div>
        </section>

        <section id="presentation">
          <h2>À propos de Nausicaa</h2>
          <div className="presentation-container">
            <div className="presentation-text">
              <p>Nausicaa est un jeu de plateau stratégique au tour par tour qui donne vie à des créatures mythologiques sur un champ de bataille dynamique de 10x8 cases. Inspiré par les échecs et les guerres mythologiques, les joueurs construisent leur deck, gèrent leur mana et déploient stratégiquement leurs unités légendaires pour vaincre leur adversaire.</p>
              <p>Chaque partie est un affrontement d'intelligence où tactique et anticipation sont les clés de la victoire. Votre objectif : éliminer l'Oracle de votre adversaire tout en protégeant le vôtre.</p>
            </div>
            <div className="presentation-image">
              <img src="/assets/gameplay.jpg" alt="Illustration de Nausicaa" />
            </div>
          </div>
        </section>

        <section id="how-to-play">
          <h2>Comment jouer</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon">1</div>
              <h3>Construisez votre deck</h3>
              <p>Assemblez un deck de 15 unités mythologiques pour votre armée.</p>
            </div>
            <div className="step">
              <div className="step-icon">2</div>
              <h3>Déployez sur le plateau</h3>
              <p>Placez stratégiquement vos unités dans votre zone de déploiement de 2 rangées.</p>
            </div>
            <div className="step">
              <div className="step-icon">3</div>
              <h3>Gérez votre mana</h3>
              <p>Utilisez judicieusement votre mana pour invoquer des unités, attaquer et activer des capacités spéciales.</p>
            </div>
            <div className="step">
              <div className="step-icon">4</div>
              <h3>Éliminez l'Oracle adverse</h3>
              <p>Manœuvrez vos unités pour capturer l'Oracle adverse et remporter la victoire.</p>
            </div>
          </div>

          <div className="gameplay-details">
            <h3>Le plateau de jeu</h3>
            <div className="gameplay-container">
              <div className="gameplay-image">
                <img src="/assets/board.svg" alt="Plateau de jeu Nausicaa" />
              </div>
              <div className="gameplay-text">
                <p>Le champ de bataille de Nausicaa est un plateau d'échecs modifié de 10x8 cases où chaque joueur dispose d'une zone de déploiement de 2 rangées.</p>
                <p>Les deux rangées du bas (rouges) constituent la zone de déploiement du Joueur 1, tandis que les deux rangées du haut (bleues) sont réservées au Joueur 2.</p>
                <p>Le plateau peut être personnalisé avec des obstacles, des terrains spéciaux et des zones magiques pour varier les stratégies de jeu.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="units-types">
          <h2>Les unités de Nausicaa</h2>
          <p>Découvrez les différentes unités mythologiques que vous pouvez contrôler dans le jeu. Chaque unité possède des capacités uniques et un coût en mana spécifique.</p>
          <div className="units-container">
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/oracle.svg" alt="Oracle" /></div>
              <h3>Oracle (Unité Royale)</h3>
              <p style={{ textAlign: 'left' }}>L'unité royale à protéger. Se déplace dans les 8 cases environnantes pour 1 mana (2 mana pour un dash). Sa perte signifie la défaite.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> Gratuit</p>
                <p><b>• Mouvement:</b> 8 cases environnantes.</p>
                <p><b>• Règle Spéciale:</b> 1 mana pour se déplacer, 2 pour dasher.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/gobelin.svg" alt="Gobelin" /></div>
              <h3>Gobelin (1 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Unité offensive de base. Avance jusqu'à 3 cases et attaque dans 4 directions latérales.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 1 Mana</p>
                <p><b>• Mouvement:</b> Avant jusqu'à 3 cases.</p>
                <p><b>• Attaque:</b> 4 directions latérales.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/harpy.svg" alt="Harpie" /></div>
              <h3>Harpie (1 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Se déplace dans les 8 directions. Peut déclencher une attaque explosive qui détruit les unités adjacentes et elle-même.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 1 Mana</p>
                <p><b>• Mouvement:</b> 8 cases environnantes.</p>
                <p><b>• Capacité Spéciale:</b> Attaque explosive à usage unique.</p>
                <p><b>• Attention:</b> Peut blesser vos propres unités.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/naiad.svg" alt="Naïade" /></div>
              <h3>Naïade (1 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Unité de support. Fait piocher une carte à l'invocation et à sa destruction. Ne peut pas attaquer.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 1 Mana</p>
                <p><b>• Capacité:</b> Pioche une carte à l'invocation et à la destruction.</p>
                <p><b>• Ne peut pas attaquer.</b></p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/griffin.svg" alt="Griffon" /></div>
              <h3>Griffon (2 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Saute 2 cases latéralement. Pioche une carte lorsqu'il saute par-dessus une unité.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 2 Mana</p>
                <p><b>• Mouvement:</b> Saute de 2 cases latéralement.</p>
                <p><b>• Capacité Spéciale:</b> Pioche une carte en sautant par-dessus une unité.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/siren.svg" alt="Sirène" /></div>
              <h3>Sirène (2 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Attaque simultanément dans les 4 diagonales. Attention au tir ami !</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 2 Mana</p>
                <p><b>• Mouvement:</b> Latéral limité.</p>
                <p><b>• Attaque:</b> 4 diagonales simultanément.</p>
                <p><b>• Attention:</b> Peut blesser vos propres unités.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/centaur.svg" alt="Centaure" /></div>
              <h3>Centaure (2 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Peut attirer n'importe quelle unité de 2 cases vers lui pour 1 mana supplémentaire.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 2 Mana</p>
                <p><b>• Capacité:</b> Tire une unité de 2 cases pour 1 mana.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/archer.svg" alt="Archer" /></div>
              <h3>Archer (3 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Se déplace latéralement et attaque jusqu'à 3 cases en diagonale.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 3 Mana</p>
                <p><b>• Mouvement:</b> Latéral.</p>
                <p><b>• Attaque:</b> Diagonale, portée de 3 cases.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/phoenix.svg" alt="Phénix" /></div>
              <h3>Phénix (3 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Ne peut se déplacer et attaquer que sur les cases sombres du plateau, en diagonale.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 3 Mana</p>
                <p><b>• Mouvement:</b> Diagonal, uniquement sur cases sombres.</p>
                <p><b>• Restriction:</b> Ne peut agir que sur les cases sombres.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/shapeshifter.svg" alt="Métamorphe" /></div>
              <h3>Métamorphe (4 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Peut échanger sa place avec n'importe quelle unité sauf l'Oracle. Ne peut pas attaquer après l'échange.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 4 Mana</p>
                <p><b>• Capacité:</b> Échange de place avec une unité (sauf Oracle).</p>
                <p><b>• Restriction:</b> Ne peut pas attaquer le tour du téléport.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/seer.svg" alt="Voyant" /></div>
              <h3>Voyant (4 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Génère du mana supplémentaire chaque tour mais ne peut ni se déplacer ni attaquer.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 4 Mana</p>
                <p><b>• Capacité:</b> Génère du mana supplémentaire.</p>
                <p><b>• Limitation:</b> Ne peut ni bouger, ni attaquer.</p>
              </div>
            </div>
            <div className="unit-card">
              <div className="unit-image"><img src="/assets/pions/titan.svg" alt="Titan" /></div>
              <h3>Titan (6 Mana)</h3>
              <p style={{ textAlign: 'left' }}>Détruit les unités environnantes à son invocation. Dispose d'attaques de zone dévastatrices.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> 6 Mana</p>
                <p><b>• Effet d'Invocation:</b> Détruit les unités adjacentes.</p>
                <p><b>• Attaque:</b> Puissante attaque à distance avec effet de zone.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="newsletter">
          <div className="newsletter-container">
            <h2>Restez informé</h2>
            <p>Inscrivez-vous à notre newsletter pour recevoir les dernières nouvelles, mises à jour et offres spéciales.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Votre adresse email" required />
              <button type="submit" className="btn primary">S'inscrire</button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Nausicaa</h2>
            <p>Stratégie mythologique sur plateau.</p>
            <p>La plupart des effets sonores viennent de Dota 2.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Liens rapides</h3>
              <ul>
                <li><a href="#accueil">Accueil</a></li>
                <li><a href="#regles">Règles</a></li>
                <li><a href="#unites">Unités</a></li>
                <li><a href="#boutique">Boutique</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Communauté</h3>
              <ul>
                <li><a href="#forum">Forum</a></li>
                <li><a href="#tournois">Tournois</a></li>
                <li><a href="#evenements">Événements</a></li>
              </ul>
            </div>
          </div>
          <div className="social-links">
            <a href="https://instagram.com/fox3000foxy" target="_blank" className="social-icon">Instagram</a>
            <a href="https://discord.gg/fox3000foxy" target="_blank" className="social-icon">Discord</a>
            <a href="https://github.com/Nausicaa-game/nausicaa-game.github.io" target="_blank" className="social-icon">Code source</a>
          </div>
        </div>
        <div className="copyright">
          <p>© 2025 Nausicaa Game. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  )
}
