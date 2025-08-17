function inspect(value) {
  console.log("---- INSPECT START ----");
  console.log(value); // prints nicely
  console.dir(value, { depth: null }); // good for objects
  console.log("---- INSPECT END ----");
}

function inspectAndDie(value) {
  console.log("---- INSPECT AND DIE ----");
  console.log(value);
  console.dir(value, { depth: null });
  throw new Error("Execution stopped after inspectAndDie()");
}
