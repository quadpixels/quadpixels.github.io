const path = require('path');
const { spawn } = require('child_process');

describe('vectortest', () => {
    it('logs out multiple params - 2 strings', done => {
      const testAppFilePath = path.join(
        __dirname,
        './vectortest_test.js',
      )
      const testApp = spawn('node', [testAppFilePath])
      let flag0 = false, flag1 = false;
      testApp.stdout.on('data', data => {
        if (data.toString().indexOf("Update1DArray v 2 233333") != -1) {
          flag0 = true;
        }
        else if (data.toString().indexOf("v[2]=233333") != -1) {
          flag1 = true;
        }

        if (flag0 && flag1) { done(); }
      })
    })
  });