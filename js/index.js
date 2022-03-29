;(function(){

  var xFrom = function(arr, i, dist){
      var distFrom0 = i + dist;
      bId = distFrom0 % arr.length;
      bId = bId < 0 ? arr.length + bId : bId;
      return arr[bId];
  }

var defaultOptions = {
  container: 'sheet',
  length: 16,
  beat: 4,
  scale: 'C',
  progression: [ 'c:M7', 'f:M7', 'g:7', 'c:M7' ],
};

var songs = {
  'something about us' : ['bb:M7', 'a:m7', 'd:m9', 'g:7', 'bb:M7', 'a:7', 'd:m7', 'g:sus2'],
};

var app = new Musica(defaultOptions);


var metronome_s = new Audio('sounds/metronome_s.mp3');
var metronome_w = new Audio('sounds/metronome_w.mp3');
var baseSounds = {
  a: new Audio('sounds/a.mp3'),
  b: new Audio('sounds/b.mp3'),
  bb: new Audio('sounds/bb.mp3'),
  c: new Audio('sounds/c.mp3'),
  d: new Audio('sounds/d.mp3'),
  f: new Audio('sounds/f.mp3'),
  g: new Audio('sounds/g.mp3'),
}

var metronomeToggle = document.getElementById('metronome-toggle');

var playing = false,
metronome,
basePlay;

metronomeToggle.addEventListener('click', function(){
  if (playing) {
    clearInterval(metronome);
    clearInterval(basePlay);
    for (var note in baseSounds) {
      baseSounds[note].pause();
      baseSounds[note].currentTime = 0;
    }
  } else {
    var intervalTime = document.getElementById('metronome-time').value;
    metronome = setInterval(function(){
      metronome_w.play();
    }, intervalTime);

    setTimeout(function(){
      var baseCurrent = 0;
      var basePrev;
      basePlay = setInterval(function(){
        if (basePrev) {
          baseSounds[basePrev].pause();
          baseSounds[basePrev].currentTime = 0;
        }

        var note = xFrom(app.progression,0,baseCurrent).split(':')[0];
        baseSounds[note].play();
        basePrev = note;
        baseCurrent++;
      }, intervalTime*4);
    },intervalTime);
  }
  playing = !playing;
});

var refreshSheet = document.getElementById('refresh-sheet');
refreshSheet.addEventListener('click', function(){
  app.refresh();
});

})();
