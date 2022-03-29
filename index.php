<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Música a primera vista</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <style media="screen">
      html, body {
        margin: 0;
        height: 100%;
      }

      .main-content {
        min-height: 100%;
        background-image: linear-gradient(to bottom right, #375bfa, #4c188f);
        padding: 15px;
        box-sizing: border-box;
      }

      .sheet-container {
        background-color: #FFF;
        padding: 30px 40px;
        border-radius: 3px;
        box-shadow: 0px 3px 8px 0 rgba(0, 0, 0, 0.5);
      }
    </style>
  </head>
  <body>
    <main class="main-content">
      <div class="sheet-container">
        <div class="form-inline">
          <input id="metronome-time" class="form-control input-sm" type="number" name="" value="" max="2500" min="200">
          <button id="metronome-toggle" class="btn btn-default btn-sm">Play / Stop</button>
          <button id="refresh-sheet" class="btn btn-default btn-sm">Refresh</button>
        </div>
        <div id="sheet"></div>
      </div>
    </main>
    <script src="js/vexflow.min.js"></script>
    <script src="js/musica.js"></script>
    <script src="js/index.js"></script>
  </body>
</html>
