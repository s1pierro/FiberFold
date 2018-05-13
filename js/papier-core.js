
function rebuildpatterns ()
{

}


function checkpatterns ()
{

	
}


var Acontext = new AudioContext();

function playSound() {

    
	// Stéréo
	var nombreCanaux = 2;

	// Crée une mémoire tampon vide de 2 secondes
	// à la fréquence d'échantillonage du contexte AudioContext
	var nombreFrames = contexteAudio.sampleRate * 2.0;
	var tableauDonnees = audioCtx.createBuffer(nombreCanaux, nombreFrames, contexteAudio.sampleRate);
  // remplit la mémoire tampon avec du bruit blanc
  // valeurs aléatoires entre -1.0 et 1.0
  for (var canal = 0; canal < nombreCanaux; canal++) {
    // génère le tableau contenant les données
    var tampon = tableauDonnees.getChannelData(canal);
    for (var i = 0; i < nombreFrames; i++) {
      // Math.random() donne une valeur comprise entre [0; 1.0]
      // l'audio doit être compris entre [-1.0; 1.0]
      tampon[i] = Math.random() * 2 - 1;
    }
  }
	
// Récupère un AudioBufferSourceNode.
  // C'est un AudioNode à utiliser quand on veut jouer AudioBuffer
  var source = contexteAudio.createBufferSource();

  // assigne le buffer au AudioBufferSourceNode
  source.buffer = tableauDonnees;

  // connecte le AudioBufferSourceNode avec
  // la destination pour qu'on puisse entendre le son
  source.connect(contexteAudio.destination);

  // lance la lecture du so
  source.start();

}
