let ABCstring = "L:1/4\n";
let tempoABCstring = [];
let tempo = [];
let tempo_counter = 0;
let ANGLO_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
let notes = [];
let repetition = [];
let repetition_tempo = [];
let isdiese = false;
let slice_level = 0;
let start_repetition = 0;
let end_repetition = 0;
let last_caller = 0;
let title = ""

var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-basic-min.js';
document.head.appendChild(script);

render_div = document.createElement("div");
render_div.setAttribute("id","ABCrender");
document.getElementById("print").appendChild(render_div)
document.getElementsByClassName("list-group")[0].setAttribute("style","height: 0px;overflow: hidden;");

title = document.getElementsByClassName("print-title")[0].textContent
document.getElementsByClassName("print-only")[0].remove()

function isNote(word) {
    for (loop = 0; loop < 7; loop++) {
        if (word.startsWith(ANGLO_NOTES[loop])) {
            return true;
        }
    }
    return false;
}

/* Récupère les informations brutes */
for (i = 0; i < document.getElementsByClassName("list-group-note").length; i++) {
    notes.push(
        document.getElementsByClassName("list-group-note")[i].firstChild.firstChild.getAttribute("src").slice(
            document.getElementsByClassName("list-group-note")[i].firstChild.firstChild.getAttribute("src").search(/\/([^\/]+)\.png/) + 1, -4
        )
    );
    tempo.push(0)
}

if (notes.indexOf("not-found") != -1) {
    console.error("Impossible d'effectuer le rendus, certaines notes sont injouables !");
    alert("Impossible d'effectuer le rendus, certaines notes sont injouables !");
}

/* Transforme les notes en leur équivalent ABC */
for (i = 0; i < notes.length; i++) {
    isdiese = false;
    slice_level = 0;
    if (notes[i] == "empty") {
        notes[i] = "z";
        tempo[i] = 1;
    }
    if (notes[i] == "barre") {
        notes[i] = "|";
    }
    if (isNote(notes[i])) {
        if (notes[i].slice(1, 2) == "-") {
            isdiese = true;
            slice_level = 1;
        }
        if (notes[i].slice(1 + slice_level, 2 + slice_level) >= 5) {
            notes[i] = notes[i].slice(0, 1) + "'".repeat(notes[i].slice(1 + slice_level, 2 + slice_level) - 5);
        } else {
            notes[i] = notes[i].slice(0, 1) + ",".repeat(5 - notes[i].slice(1 + slice_level, 2 + slice_level));
        }
        tempo[i] = 1;
        if (isdiese) {
            notes[i] = "^" + notes[i];
        }
        if (notes[i + 1] == "tiret") {
            notes[i] = notes[i] + "2";
            tempo[i] = 2;
        }
        if (notes[i + 1] == "tiretx2") {
            notes[i] = notes[i] + "3";
            tempo[i] = 3;
        }
    }
}

/* Récupère les liaisons */
for (i = 0; i < document.getElementsByClassName("list-group-note").length; i++) {
    if (document.getElementsByClassName("list-group-note")[i].firstChild.getAttribute("class").endsWith(3)) {
        notes[i] = notes[i] + ")";
    }
    if (document.getElementsByClassName("list-group-note")[i].firstChild.getAttribute("class").endsWith(1)) {
        notes[i] = "(" + notes[i];
    }
}

/* Supprime les tirets */
while (notes.indexOf("tiret") != -1) {
    tempo.splice(notes.indexOf("tiret"), 1);
    notes.splice(notes.indexOf("tiret"), 1);
}
while (notes.indexOf("tiretx2") != -1) {
    tempo.splice(notes.indexOf("tiretx2"), 1);
    notes.splice(notes.indexOf("tiretx2"), 1);
}

/* Transforme et gère les parenthèse et répétitions */
for (number = 2; number < 5; number++) {
    while (notes.indexOf("x" + number) != -1) {
        start_repetition = 0;
        end_repetition = 0;
        if (notes[notes.indexOf("x" + number) - 1] == "parenthesis-close") {
            end_repetition = notes.indexOf("x" + number) - 1;
            start_repetition = notes.indexOf("x" + number) - 1;
            while (notes[start_repetition - 1] != "parenthesis-open" && start_repetition != 0) {
                start_repetition--;
            }
        } else {
            if (notes[notes.indexOf("x" + number) + 1] == "enter") {
                end_repetition = notes.indexOf("x" + number);
                start_repetition = notes.indexOf("x" + number);
                while (notes[start_repetition - 1] != "enter" &&  start_repetition != 0) {
                    start_repetition--;
                }
            } else {
                if (isNote(notes[notes.indexOf("x" + number) - 1])) {
                    end_repetition = notes.indexOf("x" + number);
                    start_repetition = notes.indexOf("x" + number) - 1;
                } else {
                    alert("Une répétition est incompréhensible");
                    console.error("Une répétition est incompréhensible");
                }
            }
        }
        repetition = notes.slice(start_repetition, end_repetition);
        repetition_tempo = tempo.slice(start_repetition, end_repetition);
        for (loop = 1; loop < number; loop++) {
            for (indice = 0; indice < repetition.length; indice++) {
                notes.splice(end_repetition + indice, 0, repetition[indice]);
                tempo.splice(end_repetition + indice, 0, repetition_tempo[indice]);
            }
        }
        tempo.splice(notes.indexOf("x" + number), 1);
        notes.splice(notes.indexOf("x" + number), 1);

    }
}

/* Supprime les parenthèses et convertit les retours à la ligne */
while (notes.indexOf("parenthesis-open") != -1) {
    tempo.splice(notes.indexOf("parenthesis-open"), 1);
    notes.splice(notes.indexOf("parenthesis-open"), 1);
}
while (notes.indexOf("parenthesis-close") != -1) {
    tempo.splice(notes.indexOf("parenthesis-close"), 1);
    notes.splice(notes.indexOf("parenthesis-close"), 1);
}
while (notes.indexOf("enter") != -1) {
    notes[notes.indexOf("enter")] = "EOL";
}

function partitionRender(system_lenght=15){
    /* Découpe la partition pour la lisibilitée */
    tempo_counter = 0;
    tempoABCstring = [];
    for (i=0; i<notes.length; i++) {
        tempoABCstring.push(notes[i]);
        tempo_counter += tempo[i];
        if (tempo_counter >= system_lenght){
            while (tempo[i+1] == 0 && notes[i+1] != "EOL") {
                i++;
                tempoABCstring.push(notes[i]);
            }
            if (notes[i+1] == "EOL") {
                tempoABCstring.push("|");
                i++;
                tempoABCstring.push("\n");
            }
            else {
                tempoABCstring.push("\n");
            }
            tempo_counter = 0;
        }
    }
    ABCstring = "L:1/4\n";
    /* Concatène la liste en une chaîne */
    for (i = 0; i < tempoABCstring.length; i++) {
        ABCstring += tempoABCstring[i];
    }

    /* Supprime les doubles et triples retours à la ligne */
    ABCstring = ABCstring.replaceAll("EOLEOLEOL", "||\n");
    ABCstring = ABCstring.replaceAll("EOLEOL", "|\n");
    ABCstring = ABCstring.replaceAll("EOL", "|");
    if (ABCstring.slice(-1) == "\n") {
        ABCstring = ABCstring.slice(0,-1);
    }
    ABCstring = "T: " + title + "\n" + ABCstring + "|]"

    console.log(ABCstring);

    /* Utilisation de la librairie abcjs */
    ABCJS.renderAbc("ABCrender", ABCstring, { responsive: 'resize'});
}

slider = document.getElementsByClassName("vue-slider-dot-tooltip-text")[0];
slider_textNode = slider.firstChild;
slider_observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'characterData') {
        clearTimeout(last_caller);
        console.log("Rechargement de la partition")
        slider_value = slider.innerHTML / 10;
        while (!!document.getElementById("ABCrender").children[0]) {
            document.getElementById("ABCrender").children[0].remove();
        }
        last_caller = setTimeout(partitionRender, 1000, slider_value);
    }
  });
});
slider_observer.observe(slider_textNode, { characterData: true });
partitionRender(20);
