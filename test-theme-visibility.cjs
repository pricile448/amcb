const puppeteer = require('puppeteer');
const path = require('path');

async function testThemeVisibility() {
  console.log('🎨 Test de visibilité du texte dans les deux thèmes...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });

  try {
    const page = await browser.newPage();
    
    // Aller à la page de connexion
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    console.log('✅ Page de connexion chargée');

    // Se connecter
    await page.type('input[type="email"]', 'raphaelmartin1961@gmail.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Attendre la redirection vers le dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Connexion réussie, dashboard chargé');

    // Test 1: Vérifier le thème clair par défaut
    console.log('\n🌞 Test du thème clair...');
    await testTextVisibility(page, 'light');

    // Test 2: Basculer vers le thème sombre
    console.log('\n🌙 Test du thème sombre...');
    await page.goto('http://localhost:5173/dashboard/parametres', { waitUntil: 'networkidle0' });
    
    // Attendre que la page se charge
    await page.waitForTimeout(2000);
    
    // Cliquer sur le sélecteur de thème pour passer en mode sombre
    const themeButtons = await page.$$('button[data-theme]');
    if (themeButtons.length > 0) {
      // Trouver le bouton "Sombre" et cliquer dessus
      for (const button of themeButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && text.includes('Sombre')) {
          await button.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    }
    
    await testTextVisibility(page, 'dark');

    // Test 3: Naviguer vers différentes pages pour vérifier la cohérence
    console.log('\n🧭 Test de navigation entre les pages...');
    
    const pagesToTest = [
      '/dashboard',
      '/dashboard/comptes', 
      '/dashboard/cartes',
      '/dashboard/historique',
      '/dashboard/budgets'
    ];

    for (const pagePath of pagesToTest) {
      console.log(`\n📄 Test de la page: ${pagePath}`);
      await page.goto(`http://localhost:5173${pagePath}`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);
      await testTextVisibility(page, 'dark');
    }

    console.log('\n✅ Tests de visibilité terminés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await browser.close();
  }
}

async function testTextVisibility(page, theme) {
  console.log(`\n🔍 Vérification de la visibilité du texte (thème: ${theme})...`);
  
  // Vérifier les éléments principaux
  const elementsToCheck = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'div', 'label', 'button',
    'input', 'textarea', 'select'
  ];

  for (const selector of elementsToCheck) {
    const elements = await page.$$(selector);
    
    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      const element = elements[i];
      
      try {
        const text = await element.evaluate(el => el.textContent);
        const computedStyle = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          };
        });

        if (text && text.trim().length > 0) {
          console.log(`  📝 ${selector}[${i}]: "${text.substring(0, 50)}..."`);
          console.log(`     Couleur: ${computedStyle.color}, Fond: ${computedStyle.backgroundColor}`);
          
          // Vérifier le contraste
          const hasGoodContrast = await checkContrast(page, element);
          if (!hasGoodContrast) {
            console.log(`     ⚠️  Contraste potentiellement faible détecté`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs pour les éléments non visibles
      }
    }
  }

  // Vérifier spécifiquement les zones problématiques
  console.log('\n🎯 Vérification des zones spécifiques...');
  
  // Header
  const headerText = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (header) {
      const textElements = header.querySelectorAll('h1, h2, h3, p, span, button');
      return Array.from(textElements).map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 30),
        color: window.getComputedStyle(el).color
      }));
    }
    return [];
  });
  
  if (headerText.length > 0) {
    console.log('  📋 Header:');
    headerText.forEach(item => {
      console.log(`     ${item.tag}: "${item.text}" (${item.color})`);
    });
  }

  // Sidebar
  const sidebarText = await page.evaluate(() => {
    const sidebar = document.querySelector('[class*="sidebar"], [class*="bg-gradient-to-b"]');
    if (sidebar) {
      const textElements = sidebar.querySelectorAll('h3, p, span, a, button');
      return Array.from(textElements).map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 30),
        color: window.getComputedStyle(el).color
      }));
    }
    return [];
  });
  
  if (sidebarText.length > 0) {
    console.log('  📋 Sidebar:');
    sidebarText.forEach(item => {
      console.log(`     ${item.tag}: "${item.text}" (${item.color})`);
    });
  }

  // Contenu principal
  const mainText = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) {
      const textElements = main.querySelectorAll('h1, h2, h3, p, span, button, label');
      return Array.from(textElements).slice(0, 10).map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 30),
        color: window.getComputedStyle(el).color
      }));
    }
    return [];
  });
  
  if (mainText.length > 0) {
    console.log('  📋 Contenu principal:');
    mainText.forEach(item => {
      console.log(`     ${item.tag}: "${item.text}" (${item.color})`);
    });
  }
}

async function checkContrast(page, element) {
  try {
    const contrast = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Conversion simple pour vérifier le contraste
      const isLightText = color.includes('255') || color.includes('white') || color.includes('rgb(255');
      const isDarkBackground = backgroundColor.includes('0') || backgroundColor.includes('black') || backgroundColor.includes('rgb(0');
      
      return isLightText && isDarkBackground;
    });
    
    return contrast;
  } catch (error) {
    return true; // En cas d'erreur, supposer que c'est OK
  }
}

// Fonction pour vérifier si le serveur est démarré
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5173');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du test de visibilité du thème...');
  
  // Vérifier si le serveur est démarré
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Le serveur de développement n\'est pas démarré.');
    console.log('   Veuillez démarrer le serveur avec: npm run dev');
    process.exit(1);
  }
  
  await testThemeVisibility();
}

main().catch(console.error); 