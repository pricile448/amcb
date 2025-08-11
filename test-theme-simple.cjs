// Test script pour vérifier le fonctionnement du thème
// À exécuter dans la console du navigateur

console.log('🧪 Test du système de thème...');

// Fonction pour tester le changement de thème
function testTheme(theme) {
  console.log(`\n🎨 Test du thème: ${theme}`);
  
  // Appliquer le thème
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  
  if (theme === 'dark') {
    root.classList.add('dark');
    console.log('✅ Classe "dark" ajoutée');
  } else if (theme === 'light') {
    root.classList.add('light');
    console.log('✅ Classe "light" ajoutée');
  } else if (theme === 'auto') {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
      root.classList.add('dark');
      console.log('✅ Mode auto: classe "dark" ajoutée (préférence système)');
    } else {
      root.classList.add('light');
      console.log('✅ Mode auto: classe "light" ajoutée (préférence système)');
    }
  }
  
  // Vérifier les classes appliquées
  const hasDark = root.classList.contains('dark');
  const hasLight = root.classList.contains('light');
  console.log(`📋 Classes appliquées: dark=${hasDark}, light=${hasLight}`);
  
  // Vérifier les couleurs
  const bgColor = getComputedStyle(document.body).backgroundColor;
  const textColor = getComputedStyle(document.body).color;
  console.log(`🎨 Couleurs: bg=${bgColor}, text=${textColor}`);
  
  return { hasDark, hasLight, bgColor, textColor };
}

// Test de tous les thèmes
console.log('\n=== TESTS DES THÈMES ===');

const lightResult = testTheme('light');
const darkResult = testTheme('dark');
const autoResult = testTheme('auto');

// Résumé des tests
console.log('\n=== RÉSUMÉ DES TESTS ===');
console.log('☀️ Mode Light:', lightResult);
console.log('🌙 Mode Dark:', darkResult);
console.log('🔄 Mode Auto:', autoResult);

// Vérifier si les changements sont visibles
const lightDarkDifferent = lightResult.bgColor !== darkResult.bgColor;
console.log(`\n✅ Les thèmes light et dark sont différents: ${lightDarkDifferent ? 'OUI' : 'NON'}`);

if (lightDarkDifferent) {
  console.log('🎉 Le système de thème fonctionne correctement !');
} else {
  console.log('⚠️ Les thèmes ne semblent pas différents. Vérifiez la configuration CSS.');
}

// Fonction pour tester le localStorage
function testLocalStorage() {
  console.log('\n💾 Test du localStorage...');
  
  // Sauvegarder un thème
  localStorage.setItem('theme', 'dark');
  const saved = localStorage.getItem('theme');
  console.log(`Thème sauvegardé: ${saved}`);
  
  // Nettoyer
  localStorage.removeItem('theme');
  console.log('localStorage nettoyé');
}

testLocalStorage();

console.log('\n✅ Tests terminés !'); 