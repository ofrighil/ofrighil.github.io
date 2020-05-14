function getNames() {
  const table = document.getElementById("participants-table");

  const names = new Set()
  for (let i = 1; i <= table.rows.length - 1; i++) {
    names.add(table.rows[i].cells[0].innerText);
  }

  return names
}

function updateBalance(participant, amount) {
  const table = document.getElementById("participants-table");
  for (row of table.rows) {
    if (row.cells[0].innerText == participant) {
      prevBalance = Number(row.cells[1].innerText);
      newBalance = addTwoVals(prevBalance, amount);
      row.cells[1].innerText = newBalance.toFixed(2);
    }
  }
}

function insertParticipant(generateGraph=true) {
  const nameInput = document.getElementById("new-name");

  let name = nameInput.value;
  // If name is blank, don't insert
  if (name == '') return

  const names = getNames();
  // If name is already in table, don't insert
  if (names.has(name)) {
    nameInput.value = '';
    return
  }

  // Limits the number of participants
  if (names.size >= N) {
    alert(`The number of participants may not exceed ${N}.`);
    nameInput.value = '';
    return
  }

  addName(name, generateGraph);

  nameInput.value = ''; // Clear name from input
}

function addName(name, generateGraph) {
  // add name to table
  const table = document.getElementById("participants-table");
  const row = table.insertRow(-1);
  const cellName = row.insertCell(0);
  const cellBalance = row.insertCell(1);
  cellName.innerHTML = name;
  cellBalance.className = "text-right";
  cellBalance.innerHTML = "0.00";

  let reimburserOptions = $("#reimbursers").text().trim().split(' ');
  if (reimburserOptions[0] == "") reimburserOptions = []; // just for the first time
  reimburserOptions.push(name);
  $("#reimbursers").html(reimburserOptions.map(name => `<option>${name} </option>`)).selectpicker("refresh");

  let reimburseeOptions = $("#reimbursees").text().trim().split(' ');
  if (reimburseeOptions[0] == "") reimburseeOptions = []; // just for the first time
  reimburseeOptions.push(name);
  $("#reimbursees").html(reimburseeOptions.map(name => `<option>${name} </option>`)).selectpicker("refresh");

  if (generateGraph) {
    createInefficientNetwork();
    createAccountantNetwork();
    createEfficientNetwork();
  }
}

function insertTransaction() {
  const reimburser = $("#reimbursers");
  const reimbursee = $("#reimbursees");
  const amount = Number(document.getElementById("amount").value);

  // amount must satisfy the following checks
  if (isNaN(amount) || document.getElementById("amount").value === "") {
    alert("Please enter a number.")
    return
  }
  if (amount == 0) {
    alert("Please enter a nonzero amount.")
    return
  }
  //if (!Number.isInteger(amount)) {
  //  alert("Please choose a nonzero integer.")
  //  return
  //}
  const precisionCheck = _ => _.split(".")[1] == null || _.split(".")[1].length <= 2
  if (!precisionCheck(amount.toString())) {
    alert("The amount may only be specified up to two decimal places.");
    return
  }
  if (reimburser.val() == "" || reimbursee.val() == "") {
    alert("Please choose both a reimburser and a reimbursee.");
    return
  }
  if (reimburser.val() == reimbursee.val()) {
    alert("The reimburser and the reimbursee must be different participants.")
    return
  }

  addTransaction(reimburser.val(), reimbursee.val(), amount);

  reimburser.selectpicker("val", "");
  reimbursee.selectpicker("val", "");
  document.getElementById("amount").value = "";
}

function addTransaction(reimburser, reimbursee, amount, generateGraph=true) {
  const table = document.getElementById("reimbursement-table");

  const dim = table.rows.length - 1
  let cumulativeAmount;
  if (table.rows[dim].cells[2].innerText) {
    cumulativeAmount = addTwoVals(Number(table.rows[dim].cells[2].innerText.split(' ')[2]), Math.abs(amount));
  } else {
    cumulativeAmount = Math.abs(amount);
  }

  if (amount > 0) {
    updateBalance(reimburser, -amount);
    updateBalance(reimbursee, amount);
  } else {
    updateBalance(reimburser, amount);
    updateBalance(reimbursee, -amount);
  }

  table.deleteTFoot();
  const rowBody = table.insertRow(-1);
  const cellReimburser = rowBody.insertCell(0);
  const cellReimbursee = rowBody.insertCell(1);
  const cellAmount = rowBody.insertCell(2);

  if (amount > 0) {
    cellReimburser.innerHTML = reimburser;
    cellReimbursee.innerHTML = reimbursee;
  } else {
    cellReimburser.innerHTML = reimbursee;
    cellReimbursee.innerHTML = reimburser;
  }

  cellAmount.innerHTML = Math.abs(amount).toFixed(2);
  cellAmount.align = "right";

  // Recreate the footer
  const foot = table.createTFoot();
  const rowFoot = foot.insertRow(0);
  const cellFootCount = rowFoot.insertCell(0);
  cellFootCount.className = "text-left";
  if (dim == 1) {
    cellFootCount.innerHTML = `${dim} transaction`;
  } else {
    cellFootCount.innerHTML = `${dim} transactions`;
  }
  rowFoot.insertCell(1);
  const cellFootAmt = rowFoot.insertCell(2);
  cellFootAmt.className = "text-right";
  cellFootAmt.innerHTML = `cumulative amount: ${cumulativeAmount.toFixed(2)}`;

  if (generateGraph) {
    createInefficientNetwork();
    createAccountantNetwork();
    createEfficientNetwork();
  }
}
