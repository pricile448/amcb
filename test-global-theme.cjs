// Test script pour vérifier le système de thème global
// À exécuter dans la console du navigateur

console.log('🧪 Test du système de thème global...');

// Fonction pour tester le contexte de thème global
function testGlobalTheme() {
  console.log('\n=== TEST DU CONTEXTE GLOBAL ===');
  
  // Vérifier si le contexte de thème est disponible
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools détecté - contexte disponible');
  } else {
    console.log('⚠️ React DevTools non détecté');
  }
  
  // Vérifier le localStorage
  const savedTheme = localStorage.getItem('theme');
  console.log(`💾 Thème sauvegardé dans localStorage: ${savedTheme || 'aucun'}`);
  
  // Vérifier les classes sur document.documentElement
  const root = document.documentElement;
  const hasDark = root.classList.contains('dark');
  const hasLight = root.classList.contains('light');
  console.log(`📋 Classes sur <html>: dark=${hasDark}, light=${hasLight}`);
  
  // Vérifier les couleurs appliquées
  const bgColor = getComputedStyle(document.body).backgroundColor;
  const textColor = getComputedStyle(document.body).color;
  console.log(`🎨 Couleurs actuelles: bg=${bgColor}, text=${textColor}`);
  
  return { savedTheme, hasDark, hasLight, bgColor, textColor };
}

// Fonction pour tester le changement de thème
function testThemeChange() {
  console.log('\n=== TEST DU CHANGEMENT DE THÈME ===');
  
  const root = document.documentElement;
  
  // Test Light
  console.log('\n☀️ Test Light theme...');
  root.classList.remove('dark', 'light');
  root.classList.add('light');
  
  const lightBg = getComputedStyle(document.body).backgroundColor;
  const lightText = getComputedStyle(document.body).color;
  console.log(`Light theme: bg=${lightBg}, text=${lightText}`);
  
  // Test Dark
  console.log('\n🌙 Test Dark theme...');
  root.classList.remove('dark', 'light');
  root.classList.add('dark');
  
  const darkBg = getComputedStyle(document.body).backgroundColor;
  const darkText = getComputedStyle(document.body).color;
  console.log(`Dark theme: bg=${darkBg}, text=${darkText}`);
  
  // Restaurer le thème original
  const savedTheme = localStorage.getItem('theme') || 'light';
  root.classList.remove('dark', 'light');
  if (savedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
  
  return { lightBg, lightText, darkBg, darkText };
}

// Fonction pour tester les éléments de l'interface
function testUIElements() {
  console.log('\n=== TEST DES ÉLÉMENTS UI ===');
  
  const elements = {
    inputs: document.querySelectorAll('input, textarea, select'),
    buttons: document.querySelectorAll('button'),
    links: document.querySelectorAll('a'),
    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    paragraphs: document.querySelectorAll('p'),
    tables: document.querySelectorAll('table'),
  };
  
  console.log(`📊 Éléments trouvés:`);
  Object.entries(elements).forEach(([name, elementList]) => {
    console.log(`  ${name}: ${elementList.length} éléments`);
  });
  
  // Vérifier quelques éléments spécifiques
  const firstInput = elements.inputs[0];
  if (firstInput) {
    const inputBg = getComputedStyle(firstInput).backgroundColor;
    const inputText = getComputedStyle(firstInput).color;
    console.log(`🔍 Premier input: bg=${inputBg}, text=${inputText}`);
  }
  
  const firstButton = elements.buttons[0];
  if (firstButton) {
    const buttonBg = getComputedStyle(firstButton).backgroundColor;
    const buttonText = getComputedStyle(firstButton).color;
    console.log(`🔍 Premier bouton: bg=${buttonBg}, text=${buttonText}`);
  }
  
  return elements;
}

// Fonction pour tester la persistance
function testPersistence() {
  console.log('\n=== TEST DE LA PERSISTANCE ===');
  
  const originalTheme = localStorage.getItem('theme');
  console.log(`💾 Thème original: ${originalTheme || 'aucun'}`);
  
  // Sauvegarder un thème de test
  localStorage.setItem('theme', 'dark');
  console.log('💾 Thème "dark" sauvegardé');
  
  const savedTheme = localStorage.getItem('theme');
  console.log(`💾 Thème lu: ${savedTheme}`);
  
  // Restaurer le thème original
  if (originalTheme) {
    localStorage.setItem('theme', originalTheme);
  } else {
    localStorage.removeItem('theme');
  }
  console.log('💾 Thème original restauré');
  
  return { originalTheme, savedTheme };
}

// Exécuter tous les tests
console.log('\n🚀 Démarrage des tests...');

const globalResult = testGlobalTheme();
const changeResult = testThemeChange();
const uiResult = testUIElements();
const persistenceResult = testPersistence();

// Résumé des tests
console.log('\n=== RÉSUMÉ DES TESTS ===');
console.log('🌍 Thème global:', globalResult);
console.log('🔄 Changement de thème:', changeResult);
console.log('🎨 Éléments UI:', uiResult);
console.log('💾 Persistance:', persistenceResult);

// Vérifier si le système fonctionne
const isWorking = globalResult.hasDark !== globalResult.hasLight && 
                  changeResult.lightBg !== changeResult.darkBg;

console.log(`\n✅ Le système de thème global fonctionne: ${isWorking ? 'OUI' : 'NON'}`);

if (isWorking) {
  console.log('🎉 Le système de thème global est opérationnel !');
  console.log('💡 Vous pouvez maintenant utiliser le thème sur toutes les pages de l\'application.');
} else {
  console.log('⚠️ Le système de thème global ne semble pas fonctionner correctement.');
  console.log('🔧 Vérifiez la configuration CSS et le contexte React.');
}

console.log('\n✅ Tests terminés !'); 