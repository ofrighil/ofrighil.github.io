function addTwoVals(v1, v2) {
  return (v1 * 100 + v2 * 100) / 100
}

function subtractTwoVals(v1, v2) {
  return (v1 * 100 - v2 * 100) / 100
}

function createInefficientNetwork(reduced=false, label=true) {
  //const actualParticipants = new Set();
  const account = {};
  const rows = document.getElementById("reimbursement-table").rows;
  for (let i=1; i < rows.length-1; i++) {
    const reimbursee = rows[i].cells[0].innerText;
    const reimburser = rows[i].cells[1].innerText;
    const amount = Number(rows[i].cells[2].innerText);

    if (!Object.keys(account).includes(reimbursee)) account[reimbursee] = {};

    if (!Object.keys(account[reimbursee]).includes(reimburser)) account[reimbursee][reimburser] = 0;

    account[reimbursee][reimburser] += amount;
    /*
    if (reduced && Object.keys(account).includes(reimburser)) {
      if (Object.keys(account[reimburser]).includes(reimbursee)) {
        if (account[reimbursee][reimburser] >= account[reimburser][reimbursee]) {
          account[reimbursee][reimburser] -= account[reimburser][reimbursee];
          account[reimburser][reimbursee] = 0;
        } else {
          account[reimburser][reimbursee] -= account[reimburser][reimbursee];
          account[reimbursee][reimburser] = 0;
        }
      }
    }
    */
  }

  // Reduce from n(n-1) to n(n-1)/2
  if (reduced) {
    const accountHolders = Object.keys(account);
    accountHolders.forEach((receiver, i) => {
      givers = accountHolders.slice(i+1, accountHolders.length);
      if (givers.length) {
        for (giver of givers) {
          if (!accountHolders.includes(giver)) {
            continue
          } else {
            if (account[receiver][giver] >= account[giver][receiver]) {
              const newAmt = subtractTwoVals(account[receiver][giver], account[giver][receiver]);
              account[receiver][giver] = newAmt;
              account[giver][receiver] = 0;
            } else {
              const newAmt = subtractTwoVals(account[giver][receiver], account[receiver][giver]);
              account[giver][receiver] = newAmt;
              account[receiver][giver] = 0;
            }
          }
        }
      }
    })
  }

  nodeList = [];
  for (participant of getNames()) {
    nodeList.push({id: participant, label: participant});
  }

  edgeList = [];
  for (receiver of Object.keys(account)) {
    for (giver of Object.keys(account[receiver])) {
      if (!account[receiver][giver]) continue;

      const val = account[receiver][giver];
      if (label) {
        edgeList.push({from: giver, to: receiver, arrows: "to", label: val.toFixed(2)});
      } else {
        edgeList.push({from: giver, to: receiver, arrows: "to", value: val});
      }
    }
  }

  const nodes = new vis.DataSet(nodeList);
  const edges = new vis.DataSet(edgeList);
  const data = {
    nodes: nodes,
    edges: edges,
  };
  const visBox = document.getElementById("vis-1");
  const network = new vis.Network(visBox, data, {});

  // from https://stackoverflow.com/questions/49299774/how-to-limit-zooming-of-a-vis-js-network
  //here we are setting the zoom limit to move to
  let afterzoomlimit = { scale: 0.49, };
  //while zooming
  network.on("zoom",function(){
    // the limit you want to stop at
    if (network.getScale() <= 0.49 ) {
      //set this limit so it stops zooming out here
      network.moveTo(afterzoomlimit);
    }
  });
}

function createAccountantNetwork(external=true, label=true) {
  let accountant;
  if (external) {
    accountant = "accountant";
  } else {
    accountant = shuffle([...getNames()]).pop();
  }

  balance = {};
  getNames().forEach(participant => balance[participant] = 0);

  const rows = document.getElementById("reimbursement-table").rows;
  for (let i=1; i < rows.length-1; i++) {
    const reimbursee = rows[i].cells[0].innerText;
    const reimburser = rows[i].cells[1].innerText;
    const amount = Number(rows[i].cells[2].innerText);

    balance[reimbursee] = addTwoVals(balance[reimbursee], amount);
    balance[reimburser] = subtractTwoVals(balance[reimburser], amount);
  }

  const nodeList = [];
  nodeList.push({id: accountant, label: accountant, color: "#ffffb3"});
  for (participant of getNames()) {
    if (participant != accountant) {
      if (balance[participant] > 0) {
        nodeList.push({id: participant, label: participant, color: "#8dd3c7"});
      } else if (balance[participant] < 0) {
        nodeList.push({id: participant, label: participant, color: "#bebada"});
      } else {
        nodeList.push({id: participant, label: participant, color: "#ffffff"});
      }
    }
  }

  const edgeList = [];
  for (participant of Object.keys(balance)) {
    if (participant != accountant) {
      const t = Math.abs(balance[participant]);
      if (balance[participant] > 0) {
        if (label) {
          edgeList.push({from: accountant, to: participant, arrows: "to", label: t.toFixed(2)});
        } else {
          edgeList.push({from: accountant, to: participant, arrows: "to", value: t});
        }
      } else if (balance[participant] < 0) {
        if (label) {
          edgeList.push({from: participant, to: accountant, arrows: "to", label: t.toFixed(2)});
        } else {
          edgeList.push({from: participant, to: accountant, arrows: "to", value: t});
        }
      }
    }
  }

  const nodes = new vis.DataSet(nodeList);
  const edges = new vis.DataSet(edgeList);
  const data = {
    nodes: nodes,
    edges: edges,
  };
  const visBox = document.getElementById("vis-2");
  const network = new vis.Network(visBox, data, {});

  // from https://stackoverflow.com/questions/49299774/how-to-limit-zooming-of-a-vis-js-network
  //here we are setting the zoom limit to move to
  let afterzoomlimit = { scale: 0.49, };
  //while zooming
  network.on("zoom",function(){
    // the limit you want to stop at
    if (network.getScale() <= 0.49 ) {
      //set this limit so it stops zooming out here
      network.moveTo(afterzoomlimit);
    }
  });
}

function createEfficientNetwork(label=true, random=false) {
  // Initialize balances
  balance = {};
  getNames().forEach(participant => balance[participant] = 0);

  const rows = document.getElementById("reimbursement-table").rows;
  for (let i=1; i < rows.length-1; i++) {
    const reimbursee = rows[i].cells[0].innerText;
    const reimburser = rows[i].cells[1].innerText;
    const amount = Number(rows[i].cells[2].innerText);

    balance[reimbursee] = addTwoVals(balance[reimbursee], amount);
    balance[reimburser] = subtractTwoVals(balance[reimburser], amount);
  }

  const nodeList = [];
  for (participant of getNames()) {
    if (balance[participant] > 0) {
      nodeList.push({id: participant, label: participant, color: "#999999"});
    } else if (balance[participant] < 0) {
      nodeList.push({id: participant, label: participant, color: "#ef8a62"});
    } else {
      nodeList.push({id: participant, label: participant, color: "#ffffff"});
    }
  }

  const edgeList = [];
  if (random) {
    // shuffle defined in generate-random.js, line 15
    const positiveBals = shuffle(Object.keys(balance).filter(key => balance[key] > 0));
    const negativeBals = shuffle(Object.keys(balance).filter(key => balance[key] < 0));
    while (positiveBals.length && negativeBals.length) {
      const reimbursee = positiveBals[0];
      const reimburser = negativeBals[0];

      m = Math.min(balance[reimbursee], Math.abs(balance[reimburser]));
      balance[reimbursee] = subtractTwoVals(balance[reimbursee], m);
      balance[reimburser] = addTwoVals(balance[reimburser], m);

      if (label) {
        edgeList.push({from: reimburser, to: reimbursee, arrows: "to", label: m.toFixed(2)});
      } else {
        edgeList.push({from: reimburser, to: reimbursee, arrows: "to", value: m});
      }

      if (!balance[reimbursee]) positiveBals.shift();
      if (!balance[reimburser]) negativeBals.shift();
    }
  } else {
    while (Object.keys(balance).length > 1) {
      reimbursee = Object.keys(balance).reduce((key, other) => balance[key] >= balance[other] ? key : other);
      reimburser = Object.keys(balance).reduce((key, other) => balance[key] < balance[other] ? key : other);

      m = Math.min(balance[reimbursee], Math.abs(balance[reimburser]));
      if (m) {
        balance[reimbursee] = subtractTwoVals(balance[reimbursee], m);
        balance[reimburser] = addTwoVals(balance[reimburser], m);

        if (label) {
          edgeList.push({from: reimburser, to: reimbursee, arrows: "to", label: m.toFixed(2)});
        } else {
          edgeList.push({from: reimburser, to: reimbursee, arrows: "to", value: m});
        }
      }
      if (!balance[reimbursee]) delete balance[reimbursee];
      if (!balance[reimburser]) delete balance[reimburser];
    }
  }

  const nodes = new vis.DataSet(nodeList);
  const edges = new vis.DataSet(edgeList);
  const data = {
    nodes: nodes,
    edges: edges,
  };
  const visBox = document.getElementById("vis-3");
  const network = new vis.Network(visBox, data, {});

  // from https://stackoverflow.com/questions/49299774/how-to-limit-zooming-of-a-vis-js-network
  //here we are setting the zoom limit to move to
  let afterzoomlimit = { scale: 0.49, };
  //while zooming
  network.on("zoom",function(){
    // the limit you want to stop at
    if (network.getScale() <= 0.49 ) {
      //set this limit so it stops zooming out here
      network.moveTo(afterzoomlimit);
    }
  });
}
