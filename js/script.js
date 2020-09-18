const allPlaces = Array.from(document.querySelectorAll(`td`)),
    pack = document.querySelector(`.pack`),
    packLength = document.querySelector(`.pack-panel .length`),
    nextCheck = document.querySelector(`.next-check`),
    startPlace = document.querySelector(`.start-word`),
    loading = document.querySelector(`.loading`),
    gameHelps = document.querySelector(`.game-helps`);

const p1 = {
    name: `P1`,
    icon: `img/p1-icon.png`,
    pieces: new Array(7).fill(null),
    piecePlaces: Array.from(document.querySelectorAll(`.p1-panel .piece`)),
    score: 0,
    scoreBoard: document.querySelector(`.p1-panel .score`),
    lives: document.querySelector(`.p1-panel progress.lives`),
    panel: document.querySelector(`.p1-panel`),
    allWords: [],
    allPoints: [],
    allDecPoints: [],
};
const p2 = {
    name: `P2`,
    icon: `img/p2-icon.png`,
    pieces: new Array(7).fill(null),
    piecePlaces: Array.from(document.querySelectorAll(`.p2-panel .piece`)),
    score: 0,
    scoreBoard: document.querySelector(`.p2-panel .score`),
    lives: document.querySelector(`.p2-panel progress.lives`),
    panel: document.querySelector(`.p2-panel`),
    allWords: [],
    allPoints: [],
    allDecPoints: [],
};

let selectedPiece,
    passCount = 0,
    singleMode = false,
    p1IsNext = true,
    swapTurn = true,
    letters = new Array(100)
    .fill(new Piece(`blank`, 0), 0, 2)
    .fill(new Piece(`A`, 1), 2, 21)
    .fill(new Piece(`B`, 5), 21, 25)
    .fill(new Piece(`C`, 8), 25, 28)
    .fill(new Piece(`D`, 3), 28, 32)
    .fill(new Piece(`E`, 1), 32, 40)
    .fill(new Piece(`F`, 5), 40, 41)
    .fill(new Piece(`G`, 3), 41, 44)
    .fill(new Piece(`H`, 4), 44, 46)
    .fill(new Piece(`I`, 1), 46, 54)
    .fill(new Piece(`J`, 10), 54, 55)
    .fill(new Piece(`K`, 2), 55, 58)
    .fill(new Piece(`L`, 4), 58, 61)
    .fill(new Piece(`M`, 2), 61, 64)
    .fill(new Piece(`N`, 1), 64, 73)
    .fill(new Piece(`O`, 1), 73, 76)
    .fill(new Piece(`P`, 4), 76, 78)
    .fill(new Piece(`R`, 1), 78, 82)
    .fill(new Piece(`S`, 1), 82, 85)
    .fill(new Piece(`T`, 1), 85, 90)
    .fill(new Piece(`U`, 1), 90, 95)
    .fill(new Piece(`V`, 5), 95, 96)
    .fill(new Piece(`W`, 8), 96, 97)
    .fill(new Piece(`Y`, 5), 97, 99)
    .fill(new Piece(`Z`, 10), 99, 100),
    kindsLetter = [],
    places = [];

function Piece(kind, value) {
    this.kind = kind;
    this.value = value;
};

// * fill places
for (let i = 0; i < document.querySelectorAll(`tr`).length; i++) {
    places.push([...Array.from(document.querySelector(`.row-${i+1}`).childNodes).filter(p => p.nodeName != `#text`)]);
};

// * fill kindsLetter
for (let i = 0; i < letters.length; i++) {
    kindsLetter.push(letters[i].kind);
};
kindsLetter = [...new Set(kindsLetter)];
kindsLetter.shift();

function colomnPlaces(index) {
    let colomns = [];
    for (let i = 0; i < places.length; i++) {
        colomns.push(places[i][index]);
    };
    return colomns;
};

function randomSetPieces(player) {
    for (let i = 0; i < player.pieces.length; i++) {
        if (letters.length != 0 && !player.piecePlaces[i].hasChildNodes()) {
            let randomIndex = Math.round(Math.random() * (letters.length - 1));
            player.pieces.splice(i, 1, letters[randomIndex]);
            letters.splice(randomIndex, 1);
        };
    };
};

function putPieces(player) {
    for (let i = 0; i < player.piecePlaces.length; i++) {
        if (player.pieces[i] != null) {
            let newPiece = document.createElement(`img`);
            newPiece.setAttribute(`src`, `img/${player.pieces[i].kind}.png`);
            newPiece.setAttribute(`data-kind`, player.pieces[i].kind);
            newPiece.setAttribute(`data-value`, player.pieces[i].value);
            player.piecePlaces[i].appendChild(newPiece);
        };
    };
    packLength.innerHTML = letters.length;
};

function swapPiece() {
    let selectedSwaps = [],
        swapAct = player => {
            for (let iss = 0; iss < selectedSwaps.length; iss++) {
                for (let ipp = 0; ipp < player.pieces.length; ipp++) {
                    if (
                        player.pieces[ipp] != null && selectedSwaps[iss] != null &&
                        selectedSwaps[iss].kind == player.pieces[ipp].kind
                    ) {
                        letters.push(player.pieces[ipp]);
                        player.pieces.splice(ipp, 1, null);
                        selectedSwaps.splice(iss, 1, null);
                        player.piecePlaces[ipp].removeChild(player.piecePlaces[ipp].firstChild);
                    };
                };
            };
            randomSetPieces(player);
            player.piecePlaces.filter(place => place.hasChildNodes()).forEach(place => {
                place.removeChild(place.firstChild);
            });
            putPieces(player);
            setTimeout(() => {
                return resetTurn(player);
            }, 1000);
        };

    function swapSelect() {
        if (this.classList.contains(`selected`)) {
            for (let i = 0; i < selectedSwaps.length; i++) {
                if (selectedSwaps[i].kind == this.dataset.kind) {
                    selectedSwaps.splice(i, 1);
                    return this.classList.remove(`selected`);
                };
            };
        };
        selectedSwaps.push({
            kind: this.dataset.kind,
            value: this.dataset.value
        });
        this.classList.add(`selected`);
    };
    if (swapTurn) {
        let player = p1IsNext ? p1 : p2,
            pieceAvailableToSwap = player.pieces.filter(p => p != null).map(p => `<img src=img/${p.kind}.png class=available-swap data-kind=${p.kind} data-value=${p.value}>`).join(``);
        Swal.fire({
            width: 300,
            title: `Pilih huruf yang akan ditukar !!!`,
            showCancelButton: true,
            confirmButtonText: `Tukar`,
            cancelButtonText: `Batal`,
            html: pieceAvailableToSwap,
            preConfirm: () => {
                if (selectedSwaps.length == 0) {
                    Swal.showValidationMessage(`Pilih minimal 1 huruf`);
                } else if (selectedSwaps.length > letters.length) {
                    Swal.showValidationMessage(`Pertukaran huruf maksimum adalah ${letters.length} huruf`);
                };
            }
        }).then(result => {
            if (result.isConfirmed) {
                allPlaces.forEach(p => {
                    p.classList.remove(`available`);
                    p.removeEventListener(`click`, putLetter);
                });
                document.querySelectorAll(`.available-swap`).forEach(as => {
                    as.removeEventListener(`click`, swapSelect);
                });
                if (singleMode) {
                    player.score -= selectedSwaps.map(s => parseInt(s.value)).reduce((pv, cv) => pv + cv);
                    player.allDecPoints.push(...selectedSwaps.map(s => parseInt(s.value)));
                };
                swapAct(player);
            };
        });
        document.querySelectorAll(`.available-swap`).forEach(as => {
            as.addEventListener(`click`, swapSelect);
        });
    };
};

function swapBlankLetter() {
    let swapAct = player => {
        if (player.piecePlaces.some(p => p.hasChildNodes() && p.firstChild.dataset.kind == this.dataset.kind)) {
            this.classList.remove(`blank-filled`);
            this.classList.remove(`available-switch`);
            if (document.querySelector(`.available-switch`) != null &&
                document.querySelector(`.available-switch`).dataset.kind == this.dataset.kind &&
                player.pieces.some(p => !Array.from(document.querySelectorAll(`.blank-filled`)).some(b => p != null && b.dataset.kind == p.kind))
            ) {
                document.querySelector(`.available-switch`).classList.remove(`available-switch`);
            };
            for (let i = 0; i < player.piecePlaces.length; i++) {
                if (player.piecePlaces[i].hasChildNodes() && player.piecePlaces[i].firstChild.dataset.kind == this.dataset.kind) {
                    this.setAttribute(`data-value`, player.piecePlaces[i].firstChild.dataset.value);
                    player.pieces.splice(i, 1, {
                        kind: `blank`,
                        value: 0
                    });
                    player.piecePlaces[i].firstChild.classList.remove(`selected`);
                    allPlaces.forEach(p => {
                        p.classList.remove(`available`);
                        p.removeEventListener(`click`, putLetter);
                    });
                    player.piecePlaces.filter(place => place.hasChildNodes()).forEach(place => {
                        place.removeChild(place.firstChild);
                    });
                    return putPieces(player);
                };
            };
        };
    };
    p1IsNext ? swapAct(p1) : swapAct(p2);
};

function selectLetter() {
    let removeSelectPrev = () => {
        p1.piecePlaces.filter(place => place.hasChildNodes()).forEach(place => {
            place.firstChild.classList.remove(`selected`);
        });
        p2.piecePlaces.filter(place => place.hasChildNodes()).forEach(place => {
            place.firstChild.classList.remove(`selected`);
        });
    };
    allPlaces.forEach(p => {
        p.classList.remove(`available`);
        p.removeEventListener(`click`, putLetter);
    });
    if (this.hasChildNodes() && this.firstChild.classList.contains(`selected`)) {
        return removeSelectPrev();
    };
    removeSelectPrev();
    selectedPiece = this.firstChild;
    selectedPiece.classList.add(`selected`);
    if (!startPlace.hasChildNodes()) {
        startPlace.addEventListener(`click`, putLetter);
        startPlace.classList.add(`available`);
    } else {
        nextPlace().forEach(p => {
            p.addEventListener(`click`, putLetter);
            p.classList.add(`available`);
        });
    };
};

function nextPlace() {
    let placeAvailable = [],
        accum,
        closestRange = (row, col) => {
            if (places[row - 1] != null) {
                placeAvailable.push(places[row - 1][col]);
            };
            if (places[row + 1] != null) {
                placeAvailable.push(places[row + 1][col]);
            };
            placeAvailable.push(places[row][col - 1], places[row][col + 1]);
        },
        rowAreasSelecting = (row, col) => {
            if (
                places[row].filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).length > 1
            ) {
                placeAvailable.push(places[row][col - 1], places[row][col + 1]);
            } else if (
                colomnPlaces(col).filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).length > 1
            ) {
                if (places[row - 1] != null) {
                    placeAvailable.push(places[row - 1][col]);
                };
                if (places[row + 1] != null) {
                    placeAvailable.push(places[row + 1][col]);
                };
            } else {
                closestRange(row, col);
            };
            if (
                places[row].filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).length > 1
            ) {
                accum = 1;
                while (places[row][col - accum] != null && places[row][col - accum].hasChildNodes()) {
                    accum++;
                    placeAvailable.push(places[row][col - accum]);
                };
                accum = 1;
                while (places[row][col + accum] != null && places[row][col + accum].hasChildNodes()) {
                    accum++;
                    placeAvailable.push(places[row][col + accum]);
                };
            } else {
                accum = 1;
                while (places[row - accum] != null && places[row - accum][col].hasChildNodes()) {
                    accum++;
                    if (places[row - accum] != null) {
                        placeAvailable.push(places[row - accum][col]);
                    };
                };
                accum = 1;
                while (places[row + accum] != null && places[row + accum][col].hasChildNodes()) {
                    accum++;
                    if (places[row + accum] != null) {
                        placeAvailable.push(places[row + accum][col]);
                    };
                };
            };
        },
        colAreasSelecting = (row, col) => {
            if (
                colomnPlaces(col).filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).length > 1
            ) {
                if (places[row - 1] != null) {
                    placeAvailable.push(places[row - 1][col]);
                };
                if (places[row + 1] != null) {
                    placeAvailable.push(places[row + 1][col]);
                };
            } else if (
                places[row].filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).length > 1
            ) {
                placeAvailable.push(places[row][col - 1], places[row][col + 1]);
            } else {
                closestRange(row, col);
            };
            if (
                colomnPlaces(col).filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).length > 1
            ) {
                accum = 1;
                while (places[row - accum] != null && places[row - accum][col].hasChildNodes()) {
                    accum++;
                    if (places[row - accum] != null) {
                        placeAvailable.push(places[row - accum][col]);
                    };
                };
                accum = 1;
                while (places[row + accum] != null && places[row + accum][col].hasChildNodes()) {
                    accum++;
                    if (places[row + accum] != null) {
                        placeAvailable.push(places[row + accum][col]);
                    };
                };
            } else {
                accum = 1;
                while (places[row][col - accum] != null && places[row][col - accum].hasChildNodes()) {
                    accum++;
                    placeAvailable.push(places[row][col - accum]);
                };
                accum = 1;
                while (places[row][col + accum] != null && places[row][col + accum].hasChildNodes()) {
                    accum++;
                    placeAvailable.push(places[row][col + accum]);
                };
            };
        };
    for (let ir = 0; ir < places.length; ir++) {
        for (let ic = 0; ic < places[ir].length; ic++) {
            if (
                places[ir][ic].hasChildNodes() &&
                places[ir][ic].firstChild.classList.contains(`confirmed`) &&
                allPlaces.filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).length == 0
            ) {
                closestRange(ir, ic);
            } else if (
                places[ir][ic].hasChildNodes() &&
                !places[ir][ic].firstChild.classList.contains(`confirmed`)
            ) {
                if (
                    places[ir - 1] != null && places[ir - 1][ic].hasChildNodes() ||
                    places[ir + 1] != null && places[ir + 1][ic].hasChildNodes() &&
                    places[ir][ic - 1] != null && places[ir][ic - 1].hasChildNodes() ||
                    places[ir][ic + 1] != null && places[ir][ic + 1].hasChildNodes()
                ) {
                    rowAreasSelecting(ir, ic);
                    colAreasSelecting(ir, ic);
                } else if (
                    places[ir - 1] != null && places[ir - 1][ic].hasChildNodes() ||
                    places[ir + 1] != null && places[ir + 1][ic].hasChildNodes()
                ) {
                    rowAreasSelecting(ir, ic);
                } else if (
                    places[ir][ic - 1] != null && places[ir][ic - 1].hasChildNodes() ||
                    places[ir][ic + 1] != null && places[ir][ic + 1].hasChildNodes()
                ) {
                    colAreasSelecting(ir, ic);
                } else {
                    closestRange(ir, ic);
                };
            };
        };
    };
    placeAvailable = placeAvailable.filter(p => p != null && !p.hasChildNodes());
    return placeAvailable;
};

function putLetter() {
    let setBlankPiece = () => {
            Swal.fire({
                width: 250,
                title: `Pilih huruf !!!`,
                input: `select`,
                showCancelButton: true,
                confirmButtonText: `Pilih`,
                cancelButtonText: `Batal`,
                inputOptions: kindsLetter,
                inputPlaceholder: `Huruf`,
                preConfirm: result => {
                    if (result == ``) {
                        Swal.showValidationMessage(`Pilih 1 jenis huruf`);
                    };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    selectedPiece.setAttribute(`src`, `img/${kindsLetter[result.value]}.png`);
                    selectedPiece.setAttribute(`data-kind`, kindsLetter[result.value]);
                    selectedPiece.classList.add(`blank-filled`);
                    selectedPiece.addEventListener(`click`, pullLetter);
                    selectedPiece.addEventListener(`click`, swapBlankLetter);
                    p1IsNext ? putAct(p1) : putAct(p2);
                };
            });
        },
        putAct = player => {
            for (let i = 0; i < player.piecePlaces.length; i++) {
                if (selectedPiece.parentNode == player.piecePlaces[i]) {
                    player.piecePlaces[i].removeEventListener(`click`, selectLetter);
                    player.pieces.splice(i, 1, null);
                    putPieces(player);
                };
            };
            player.piecePlaces.filter(place => place.hasChildNodes()).forEach(place => {
                place.removeChild(place.firstChild);
            });
            swapTurn = false;
            this.appendChild(selectedPiece);
            nextCheck.innerHTML = `Cek`;
        };
    selectedPiece.classList.remove(`selected`);
    allPlaces.forEach(p => {
        p.classList.remove(`available`);
        p.removeEventListener(`click`, putLetter);
    });
    if (selectedPiece.dataset.kind == `blank`) {
        return setBlankPiece();
    };
    selectedPiece.addEventListener(`click`, pullLetter);
    p1IsNext ? putAct(p1) : putAct(p2);
};

function pullLetter() {
    let player = p1IsNext ? p1 : p2,
        isConnected = piece => {
            for (let ir = 0; ir < places.length; ir++) {
                for (let ic = 0; ic < places[ir].length; ic++) {
                    if (piece.parentNode == places[ir][ic]) {
                        if (
                            places[ir - 1] != null && places[ir - 1][ic].hasChildNodes() && places[ir - 1][ic].firstChild.classList.contains(`confirmed`) ||
                            places[ir][ic - 1] != null && places[ir][ic - 1].hasChildNodes() &&
                            places[ir][ic - 1].firstChild.classList.contains(`confirmed`) ||
                            places[ir + 1] != null && places[ir + 1][ic].hasChildNodes() && places[ir + 1][ic].firstChild.classList.contains(`confirmed`) ||
                            places[ir][ic + 1] != null && places[ir][ic + 1].hasChildNodes() &&
                            places[ir][ic + 1].firstChild.classList.contains(`confirmed`)
                        ) {
                            return true;
                        } else {
                            return false;
                        };
                    };
                };
            };
        },
        pieceToPull = () => {
            let pieceAvailableToPull = [],
                accum;
            for (let ir = 0; ir < places.length; ir++) {
                for (let ic = 0; ic < places[ir].length; ic++) {
                    if (this.parentNode == places[ir][ic]) {
                        pieceAvailableToPull.push(this);
                        if (places[ir + 1] != null && places[ir + 1][ic].hasChildNodes()) {
                            accum = 1;
                            while (places[ir + accum] != null && places[ir + accum][ic].hasChildNodes()) {
                                pieceAvailableToPull.push(places[ir + accum][ic].firstChild);
                                accum++;
                            };
                        } else if (places[ir][ic + 1] != null && places[ir][ic + 1].hasChildNodes()) {
                            accum = 1;
                            while (places[ir][ic + accum] != null && places[ir][ic + accum].hasChildNodes()) {
                                pieceAvailableToPull.push(places[ir][ic + accum].firstChild);
                                accum++;
                            };
                        };
                        pieceAvailableToPull = pieceAvailableToPull.filter(p => !p.classList.contains(`confirmed`));
                        if (
                            pieceAvailableToPull.includes(startPlace.firstChild) ||
                            pieceAvailableToPull.some(p => isConnected(p))
                        ) {
                            pieceAvailableToPull = [];
                            allPlaces.filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).forEach(p => pieceAvailableToPull.push(p.firstChild));
                        };
                    };
                };
            };
            return pieceAvailableToPull;
        },
        pullAct = (player, pieces) => {
            pieces.forEach(p => {
                if (p.classList.contains(`blank-filled`)) {
                    p.setAttribute(`src`, `img/blank.png`);
                    p.setAttribute(`data-kind`, `blank`);
                    p.classList.remove(`blank-filled`);
                };
                p.parentNode.removeChild(p);
                for (let i = 0; i < player.piecePlaces.length; i++) {
                    if (!player.piecePlaces[i].hasChildNodes()) {
                        player.pieces.splice(i, 1, {
                            kind: p.dataset.kind,
                            value: parseInt(p.dataset.value)
                        });
                        player.piecePlaces[i].appendChild(p);
                        return player.piecePlaces[i].addEventListener(`click`, selectLetter);
                    };
                };
            });
        };
    if (this == window) return pullAct(player, allPlaces.filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).map(p => p.firstChild));
    this.removeEventListener(`click`, pullLetter);
    selectedPiece.classList.remove(`selected`);
    allPlaces.forEach(p => {
        p.classList.remove(`available`);
        p.removeEventListener(`click`, putLetter);
    });
    pullAct(player, pieceToPull());
    if (allPlaces.filter(place => place.hasChildNodes() && !place.firstChild.classList.contains(`confirmed`)).length == 0) {
        swapTurn = true;
        nextCheck.innerHTML = `Pas`;
    };
};

function selectedWords() {
    let mainWord = [],
        word = [],
        allWords = [],
        accum,
        accum2,
        hWordSearch = (globalVessel, mainVessel, row, col, acc, vessel = null) => {
            mainVessel.push(places[row][col].firstChild);
            if (vessel != null) {
                vessel = [];
                vWordSearch(globalVessel, vessel, row, col, accum2);
                if (vessel.length >= 2) {
                    globalVessel.push(vessel);
                };
            };
            if (places[row][col - 1] != null && places[row][col - 1].hasChildNodes()) {
                acc = 1;
                while (places[row][col - acc] != null && places[row][col - acc].hasChildNodes()) {
                    mainVessel.unshift(places[row][col - acc].firstChild);
                    if (vessel != null && !places[row][col - acc].firstChild.classList.contains(`confirmed`)) {
                        vessel = [];
                        vWordSearch(globalVessel, vessel, row, col - acc, accum2);
                        if (vessel.length >= 2) {
                            globalVessel.push(vessel);
                        };
                    };
                    acc++;
                };
            };
            acc = 1;
            while (places[row][col + acc] != null && places[row][col + acc].hasChildNodes()) {
                mainVessel.push(places[row][col + acc].firstChild);
                if (vessel != null && !places[row][col + acc].firstChild.classList.contains(`confirmed`)) {
                    vessel = [];
                    vWordSearch(globalVessel, vessel, row, col + acc, accum2);
                    if (vessel.length >= 2) {
                        globalVessel.push(vessel);
                    };
                };
                acc++;
            };
        },
        vWordSearch = (globalVessel, mainVessel, row, col, acc, vessel = null) => {
            mainVessel.push(places[row][col].firstChild);
            if (vessel != null) {
                vessel = [];
                hWordSearch(globalVessel, vessel, row, col, accum2);
                if (vessel.length >= 2) {
                    globalVessel.push(vessel);
                };
            };
            if (places[row - 1] != null && places[row - 1][col].hasChildNodes()) {
                acc = 1;
                while (places[row - acc] != null && places[row - acc][col].hasChildNodes()) {
                    mainVessel.unshift(places[row - acc][col].firstChild);
                    if (vessel != null && !places[row - acc][col].firstChild.classList.contains(`confirmed`)) {
                        vessel = [];
                        hWordSearch(globalVessel, vessel, row - acc, col, accum2);
                        if (vessel.length >= 2) {
                            globalVessel.push(vessel);
                        };
                    };
                    acc++;
                };
            };
            acc = 1;
            while (places[row + acc] != null && places[row + acc][col].hasChildNodes()) {
                mainVessel.push(places[row + acc][col].firstChild);
                if (vessel != null && !places[row + acc][col].firstChild.classList.contains(`confirmed`)) {
                    vessel = [];
                    hWordSearch(globalVessel, vessel, row + acc, col, accum2);
                    if (vessel.length >= 2) {
                        globalVessel.push(vessel);
                    };
                };
                acc++;
            };
        };
    for (let ir = 0; ir < places.length; ir++) {
        for (let ic = 0; ic < places[ir].length; ic++) {
            if (places[ir][ic].hasChildNodes() && !places[ir][ic].firstChild.classList.contains(`confirmed`)) {
                if (
                    places[ir][ic + 1] != null && places[ir][ic + 1].hasChildNodes() ||
                    places[ir][ic - 1] != null && places[ir][ic - 1].hasChildNodes()
                ) {
                    hWordSearch(allWords, mainWord, ir, ic, accum, word);
                } else if (
                    places[ir + 1] != null && places[ir + 1][ic].hasChildNodes() ||
                    places[ir - 1] != null && places[ir - 1][ic].hasChildNodes()
                ) {
                    vWordSearch(allWords, mainWord, ir, ic, accum, word);
                };
                allWords.unshift(mainWord);
                return mainWord.length >= 2 ? allWords : allWords = [];
            };
        };
    };
};

function scoresCount(pieces) {
    let words = [...pieces],
        scores = [];
    for (let i = 0; i < words.length; i++) {
        let scoresPerWord = [];
        words[i].map(w => {
            if (w.parentNode.classList.contains(`letter-2`)) {
                scoresPerWord.push(parseInt(w.dataset.value) * 2);
            } else if (w.parentNode.classList.contains(`letter-3`)) {
                scoresPerWord.push(parseInt(w.dataset.value) * 3);
            } else {
                scoresPerWord.push(parseInt(w.dataset.value));
            };
        });
        scores.push(scoresPerWord.reduce((pv, cv) => pv + cv));
        if (words[i].some(w => w.parentNode.classList.contains(`word-2`))) {
            scores[i] *= Math.pow(2, words[i].filter(w => w.parentNode.classList.contains(`word-2`)).length);
        } else if (words[i].some(w => w.parentNode.classList.contains(`word-3`))) {
            scores[i] *= Math.pow(3, words[i].filter(w => w.parentNode.classList.contains(`word-3`)).length);
        };
    };
    return scores;
};

function checkingWords(pieces, words, score) {
    let player = p1IsNext ? p1 : p2,
        promisesOfWords = [],
        mainWord = [...words][0],
        fetchMainWord = () => {
            fetch(`http://kateglo.com/api.php?format=json&phrase=${mainWord}`, {
                    mode: 'no-cors'
                }).then(response => response.json())
                .finally(() => loading.style.display = ``)
                .then(response => {
                    let defs = ``;
                    response.kateglo.definition.forEach(def => {
                        defs += `${def.def_text}; `;
                    });
                    Swal.fire({
                        title: `${mainWord} (+${score} Poin)`,
                        html: defs,
                        icon: `info`
                    }).then(() => {
                        player.allWords.push(...words);
                        player.score += score;
                        removeMultipleScore(pieces);
                        if (allPlaces.filter(p => p.hasChildNodes() && !p.firstChild.classList.contains(`confirmed`)).map(p => p.firstChild).length == 7) {
                            player.score += 50;
                            Swal.fire({
                                width: 300,
                                title: `Bingo !!!`,
                                text: `(+50 Poin)`,
                                icon: `success`,
                                timer: 3000,
                                timerProgressBar: true,
                                showConfirmButton: false
                            }).then(() => {
                                player.allPoints.push(score + 50);
                                return resetTurn(player);
                            });
                        } else {
                            player.allPoints.push(score);
                            randomSetPieces(player);
                            player.piecePlaces.filter(place => place.hasChildNodes()).forEach(place => {
                                place.removeChild(place.firstChild);
                            });
                            putPieces(player);
                            return resetTurn(player);
                        };
                    });
                })
                .catch(err => {
                    if (err == `TypeError: Failed to fetch`) {
                        Swal.fire({
                            title: `Gagal untuk Fetch`,
                            html: `Periksa jaringan anda & coba lagi !!!`,
                            icon: `error`
                        });
                    };
                });
        };
    loading.style.display = `block`;
    words.map(word => {
        promisesOfWords.push(fetch(`http://kateglo.com/api.php?format=json&phrase=${word}`, {
            mode: 'no-cors'
        }).then(response => response.json()))
    });
    Promise.all(promisesOfWords)
        .finally(() => loading.style.display = ``)
        .then(() => {
            loading.style.display = `block`;
            return fetchMainWord();
        })
        .catch(err => {
            if (err == `TypeError: Failed to fetch`) {
                Swal.fire({
                    title: `Gagal untuk Fetch`,
                    html: `Periksa jaringan anda & coba lagi !!!`,
                    icon: `error`
                });
            } else {
                pullLetter();
                player.lives.value -= 1;
                Swal.fire({
                    title: `Kata tidak ditemukan !!!`,
                    icon: `warning`,
                    timer: 3000,
                    timerProgressBar: true,
                });
                return resetTurn(player);
            };
        });
};

function removeMultipleScore(pieces) {
    pieces.map(piece => {
        piece.map(p => {
            if (p.parentNode.classList.contains(`letter-2`)) {
                p.parentNode.classList.remove(`letter-2`);
            } else if (p.parentNode.classList.contains(`letter-3`)) {
                p.parentNode.classList.remove(`letter-3`);
            } else if (p.parentNode.classList.contains(`word-2`)) {
                p.parentNode.classList.remove(`word-2`);
            } else if (p.parentNode.classList.contains(`word-3`)) {
                p.parentNode.classList.remove(`word-3`);
            };
        });
    });
};

function resetTurn(player) {
    player.piecePlaces.forEach(place => place.removeEventListener(`click`, selectLetter));
    pack.removeEventListener(`click`, turnIn);
    pack.removeEventListener(`click`, swapPiece);
    allPlaces.forEach(p => {
        p.classList.remove(`available`);
        p.removeEventListener(`click`, putLetter);
        if (p.hasChildNodes()) {
            p.firstChild.classList.add(`confirmed`);
            p.firstChild.removeEventListener(`click`, pullLetter);
        };
    });
    Array.from(document.querySelectorAll(`.available-switch`)).forEach(a => {
        a.classList.remove(`available-switch`);
    });
    swapTurn = true;
    nextCheck.innerHTML = `Pas`;
    player.scoreBoard.innerHTML = player.score;
    if (singleMode) {
        return gameOverCheck(player);
    } else {
        return winnerCheck(player);
    };
};

function gameOverCheck(player) {
    if (player.lives.value == 0 || passCount > 0 || letters.length == 0 && player.pieces.filter(Boolean).length == 0) {
        let highestPoint = 0,
            averagePoint = 0,
            decrementPoint = 0,
            longestWord = 0,
            wordsPlayed = 0;
        if (player.allPoints.length != 0 || player.allWords.length != 0) {
            highestPoint = player.allPoints.sort((a, b) => b - a)[0];
            averagePoint = Math.round(player.allPoints.reduce((pv, cv) => pv + cv) / player.allPoints.length);
            longestWord = player.allWords.map(p => p.length);
            longestWord = longestWord.sort((a, b) => b - a)[0];
            wordsPlayed = player.allWords.length;
        };
        if (player.allDecPoints.length != 0) {
            decrementPoint = player.allDecPoints.reduce((pv, cv) => pv + cv) * (-1);
        };
        Swal.fire({
            width: 300,
            title: `Skor Akhir : ${player.score}`,
            html: `
                    <li>Skor Tertinggi          : ${highestPoint} Poin</li>
                    <li>Skor Rata-rata          : ${averagePoint} Poin</li>
                    <li>Pengurangan Skor        : ${decrementPoint} Poin</li>
                    <li>Kata Terpanjang         : ${longestWord} Huruf</li>
                    <li>Kata Terbentuk          : ${wordsPlayed} Kata</li>
                    <br>
                    *Pengurangan skor terjadi karena penukaran huruf, sesuai dengan jumlah poin dari huruf yang  ditukar
            `,
            imageUrl: player.icon,
            imageWidth: 70,
            imageHeight: 70,
            footer: `Muat ulang untuk memulai kembali`
        });
    } else {
        return gamePlay();
    };
};

function winnerCheck(player) {
    let enemy = player == p1 ? p2 : p1,
        countingScore = (player, enemy) => {
            if (player.score > enemy.score) {
                Swal.fire({
                    width: 300,
                    title: `${player.name} Menang !!!`,
                    imageUrl: player.icon,
                    imageWidth: 70,
                    imageHeight: 70,
                    text: `${player.name} (${player.score}) > (${enemy.score}) ${enemy.name}`,
                    footer: `Muat ulang untuk memulai kembali`
                });
            };
        },
        countingValueOfPiecesLeft = enemy => {
            let values = enemy.pieces.filter(Boolean).map(piece => piece.value).reduce((pv, cv) => pv + cv);
            return values;
        };
    if (player.lives.value == 0) {
        Swal.fire({
            width: 300,
            title: `${enemy.name} Menang !!!`,
            imageUrl: enemy.icon,
            imageWidth: 70,
            imageHeight: 70,
            text: `Nyawa ${player.name} telah habis !!!`,
            footer: `Muat ulang untuk memulai kembali`
        });
    } else if (passCount >= 6 || letters.length == 0 && player.pieces.filter(Boolean).length == 0) {
        if (letters.length == 0 && player.pieces.filter(Boolean).length == 0) {
            player.score += countingValueOfPiecesLeft(enemy);
            enemy.score -= countingValueOfPiecesLeft(enemy);
        };
        countingScore(player, enemy);
        countingScore(enemy, player);
        if (player.score == enemy.score) {
            Swal.fire({
                width: 300,
                title: `Imbang !!!`,
                imageUrl: `img/I.png`,
                imageWidth: 70,
                imageHeight: 70,
                text: `${player.name} (${player.score}) == (${enemy.score}) ${enemy.name}`,
                footer: `Muat ulang untuk memulai kembali`
            });
        };
    } else {
        p1IsNext = !p1IsNext;
        return gamePlay();
    };
};

function turnIn() {
    let playerTurn = player => {
        if (player.piecePlaces.filter(place => place.hasChildNodes()).length == 0) {
            pack.removeEventListener(`click`, turnIn);
            randomSetPieces(player);
            putPieces(player);
        };
        if (
            player.piecePlaces.some(p => p.hasChildNodes() && Array.from(document.querySelectorAll(`.blank-filled`)).some(b => b.dataset.kind == p.firstChild.dataset.kind))
        ) {
            Array.from(document.querySelectorAll(`.blank-filled`)).forEach(b => {
                if (player.piecePlaces.some(p => p.hasChildNodes() && p.firstChild.dataset.kind == b.dataset.kind)) {
                    b.classList.add(`available-switch`);
                };
            });
        };
        player.piecePlaces.filter(place => place.hasChildNodes()).forEach(place => {
            place.addEventListener(`click`, selectLetter);
        });
        if (letters.length != 0) {
            pack.addEventListener(`click`, swapPiece);
        };
    };
    p1IsNext ? playerTurn(p1) : playerTurn(p2);
};

function startScreen() {
    let selectedMode = null;

    function chooseMode() {
        document.querySelectorAll(`.choose-mode img`).forEach(m => {
            m.classList.remove(`selected`);
        });
        this.classList.add(`selected`);
        selectedMode = this;
    };
    Swal.fire({
        width: window.innerWidth,
        title: `Selamat Datang di 
                Indonesian Scrabble !!!`,
        html: `Pilih Mode Permainan !
                <br>
                <br>
                <div class="choose-mode">
                    <div>
                        <img src="img/p1-icon.png" alt="P1" class="single-player">
                        <br>
                        Pemain Tunggal
                    </div>
                    <div>
                        <img src="img/p2-icon.png" alt="vs-P2" class="multi-player selected">
                        <br>
                        Pemain Ganda
                    </div>
                </div>`,
        confirmButtonText: `Mulai !`,
        imageUrl: `img/logo.png`,
        imageWidth: 250,
        imageHeight: 250
    }).then(result => {
        if (result.isConfirmed) {
            singleMode = selectedMode != document.querySelector(`.choose-mode .multi-player`) && selectedMode != null ? true : false;
        } else {
            document.querySelectorAll(`.choose-mode img`).forEach(m => {
                m.removeEventListener(`click`, chooseMode);
            });
            return startScreen();
        };
    });
    document.querySelectorAll(`.choose-mode img`).forEach(m => {
        m.addEventListener(`click`, chooseMode);
    });
};

function gamePlay() {
    let player = p1IsNext ? p1 : p2,
        enemy = !p1IsNext ? p1 : p2;
    player.panel.style.display = `flex`;
    enemy.panel.style.display = `none`;
    if (player.piecePlaces.filter(place => place.hasChildNodes()).length == 0) {
        pack.addEventListener(`click`, turnIn);
    } else {
        turnIn();
    };
};

nextCheck.addEventListener(`click`, () => {
    let player = p1IsNext ? p1 : p2,
        wordsOfPieces = [],
        words = [],
        wordsScore;
    if (nextCheck.innerHTML == `Pas`) {
        passCount += 1;
        return resetTurn(player);
    } else if (nextCheck.innerHTML == `Cek`) {
        wordsOfPieces = [...selectedWords()];
        if (wordsOfPieces.length > 0) {
            words = wordsOfPieces.map(word => word.map(w => w.dataset.kind).reduce((pv, cv) => pv + cv));
            wordsScore = scoresCount(wordsOfPieces).reduce((pv, cv) => pv + cv);
            return checkingWords(wordsOfPieces, words, wordsScore);
        } else {
            pullLetter();
            player.lives.value -= 1;
            return resetTurn(player);
        };
    };
});

gameHelps.addEventListener(`click`, () => {
    Swal.fire({
        title: `Kredit :`,
        html: `Rest API oleh <a href="http://kateglo.com" target="_blank">kateglo.com</a>
                <br>
                Dibuat dengan SweetAlert2
                <br>
                .
                <br>
                <a href="https://id.m.wikipedia.org/wiki/Scrabble" target="_blank">Cara Bermain (?)</a>`,
        footer: `&copy 2020 kalUnite`,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: `Kembali`,
        imageUrl: `img/logo.png`,
        imageWidth: 150,
        imageHeight: 150,
        imageAlt: `IDS`
    });
});

startScreen();
gamePlay();