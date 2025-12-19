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

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// Optimize SVG rendering on page load
(function optimizeSVGRendering() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSVGOptimization);
  } else {
    initSVGOptimization();
  }

  function initSVGOptimization() {
    // Optimize Lottie animations
    const lottieElements = document.querySelectorAll('dotlottie-wc');
    lottieElements.forEach(el => {
      el.style.transform = 'translateZ(0)';
      el.style.willChange = 'transform';
    });
  }
})();