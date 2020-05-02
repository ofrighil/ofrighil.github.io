const characters = [
  "Alice", "Bob", "Carol",
  "Charlie", "Chuck", "Craig",
  "David", "Eve", "Faythe",
  "Frank", "Grace", "Heidi",
  "Ivan", "Judy", "Mallory",
  "Michael", "Niaj", "Olivia",
  "Oscar", "Peggy", "Rupert",
  "Sybil", "Trent", "Trudy",
  "Walter", "Wendy", "Zeke"
]

// Mike Bostock's JS implementaion of the the Fisher–Yates shuffle:
// https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function clearParticipants() {
  const table = document.getElementById("participants-table");
  while (table.rows.length > 1) {
    table.deleteRow(-1);
  }

  // Clear dropdowns
  $("#reimbursers").text("").selectpicker("refresh");
  $("#reimbursees").text("").selectpicker("refresh");
}

function clearTransactions() {
  document.getElementById("amount").value = "";

  const table = document.getElementById("reimbursement-table");
  while (table.rows.length > 2) {
    table.deleteRow(table.rows.length-2); // Don't want to remove the footer
  }

  // clear footer
  table.rows[1].cells[0].innerText = "";
  table.rows[1].cells[2].innerText = "";
}

function clearGraphs() {
  document.getElementById("vis-1").innerHTML = ""; // Yeah, I'll admit this is prob not the best way
  document.getElementById("vis-2").innerHTML = "";
  document.getElementById("vis-3").innerHTML = "";
}

function randPopulateParticipantsTable() {
  const characterPool = characters.slice(0, characters.length);
  const randChars = [];
  const numParticipants = Number($("#num-participants").val());
  while (randChars.length < numParticipants && characterPool.length > 0) {
    randChars.push(shuffle(characterPool).pop());
  }

  randChars.forEach((character, i) => {
    let generateGraph;
    i == randChars.length-1 ? generateGraph = true : generateGraph = false;
    addName(character, generateGraph);
  });
}

function randPopulateReimbursementsTable(maxVal) {
  let participants = getNames();
  permutations = [];
  for (reimburser of participants) {
    for (reimbursee of participants) {
      if (reimburser == reimbursee) continue;
      permutations.push([reimburser, reimbursee]);
    }
  }

  permutations = shuffle(permutations);
  permutations.forEach((permutation, i) => {
    let generateGraph;
    i == permutations.length-1 ? generateGraph = true : generateGraph = false;

    const amount = Number((Math.random() * maxVal + 0.01).toFixed(2));
    addTransaction(...permutation, amount, generateGraph);
  });
}

function clearAll() {
  clearParticipants();
  clearTransactions();
  clearGraphs();
}

function randRoll() {
  let maxVal;
  if ($("#simulated-max").val() === "") {
    maxVal = DEFAULTMAX;
  } else if (Number($("#simulated-max").val()) <= 0) {
    alert("Please enter a nonzero positive number.");
    return
  } else  if ($("#simulated-max").val().split(".")[1].length > 2) {
    alert("You can only specify up to two decimal places.");
    return
  }else {
    maxVal = Number($("#simulated-max").val());
  }

  clearAll();
  randPopulateParticipantsTable();
  randPopulateReimbursementsTable(maxVal);
}

function generateExample() {
  clearAll();

  addName("Annabelle", false);
  addName("Erwin", false);
  addName("Issac", false);
  addName("Opal", false);

  addTransaction("Annabelle", "Erwin", 7, false);
  addTransaction("Issac", "Opal", 13);
}
