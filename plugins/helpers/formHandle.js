export default {
  clearErrors: (errorsObj, vueContext, focusWrong = true) => {
    for (let prop in errorsObj) {
      vueContext.$set(errorsObj, prop, typeof prop !== "boolean" ? "" : false);
      if (vueContext.$refs[prop] && vueContext.$refs[prop].errNow) {
        vueContext.$set(vueContext.$refs[prop], "errNow", typeof prop !== "boolean" ? "" : false);
      }
    }
  },
  checkForm: (props, vueContext) => {
    let totalErrors = 0;
    let errorsAt = [];
    for (let prop of props) {
      let vueComponent = vueContext.$refs[prop];
      if (Array.isArray(vueComponent)) {
        vueComponent = vueComponent[0];
      }
      if (vueComponent) {
        if (vueComponent.inputed) {
          vueComponent.inputed();
        }
        if (vueComponent.errNow) {
          if (totalErrors === 0) {
            if (vueComponent.$el) {
              vueComponent.$el.focus();
            }
          }
          totalErrors++;
          errorsAt.push(prop);
        }
      } else {
        totalErrors++;
        errorsAt.push(prop);
        console.log(`Ref not found - ${prop}`);
      }
    }
    return {
      totalErrors,
      errorsAt,
    };
  },
};
