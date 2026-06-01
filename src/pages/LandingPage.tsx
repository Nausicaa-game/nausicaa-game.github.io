import '../css/style.css'
import '../css/fonts.css'

export default function LandingPage() {
  return (
    <>
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
              <a href="/app" className="btn primary">JOUER</a>
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
              <div className="unit-image">
                <img src="/assets/pions/oracle.svg" alt="L'Oracle" />
              </div>
              <h3>Oracle (Unité Royale)</h3>
              <p style={{ textAlign: 'left' }}>L'unité royale à protéger. Se déplace dans les 8 cases environnantes pour 1 mana (2 mana pour un dash). Sa perte signifie la défaite.</p>
              <div style={{ textAlign: 'left' }}>
                <p><b>• Coût:</b> Gratuit</p>
                <p><b>• Mouvement:</b> 8 cases environnantes.</p>
                <p><b>• Règle Spéciale:</b> 1 mana pour se déplacer, 2 pour dasher.</p>
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
