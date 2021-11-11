/**
 * ================================
 *             Grades
 * ================================
 */
// const gradeToScore = {
//   A: 4,
//   'B+': 3.5,
//   B: 3,
//   'C+': 2.5,
//   C: 2,
//   'D+': 1.5,
//   D: 1,
//   'D-': 0.5,
//   F: 0,
// };
// function calculateGpa(modules) {
//   let totalModuleCredit = 0;
//   let totalScore = 0;
//   for (let i = 0; i < modules.length; i++) {
//     const module = modules[i];
//     if (!modules[i].grade) continue;
//     const { grade, moduleCredit } = module;
//     const score = gradeToScore[grade];
//     totalModuleCredit += moduleCredit;
//     totalScore += score * moduleCredit;
//   }
//   console.log(totalModuleCredit, totalScore);
//   const gpa = totalModuleCredit ? totalScore / totalModuleCredit : 0;
//   return gpa;
// }

/**
 * ================================
 *         API connectors
 * ================================
 */
function connectToDatabase(connectionString, isReset) {
  return fetch(`/connect?reset=${isReset}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      connectionString,
    }),
  }).then(function (response) {
    if (response.status === 200) {
      return;
    }
    return response.json().then(function (response) {
      throw new Error(response.error);
    });
  });
}

function createItem(name) {
  return fetch(`/api/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
    }),
  }).then(function (response) {
    if (response.status === 201) {
      return;
    }
    return response.json().then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      //handling the error info gracefully even though it isnt a real error
      throw new Error(`Unexpected response body: ${JSON.stringify(json)}`);
    });
  });
}

function getItem() {
  return fetch('/api/modules')
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      return json.items ;
    });
}

function updateItem(name, status) {
  return fetch(`/api/modules/${name}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  }).then(function (response) {
    if (response.status === 200) {
      return;
    }
    return response.json().then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      throw new Error(`Unknown Response ${JSON.stringify(json)}`);
    });
  });
}

function deleteItem(name, status) {
  return fetch(`/api/modules/${name}`, {
    method: 'DELETE',
  }).then(function (response) {
    if (response.status === 200) {
      return;
    }
    return response.json().then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      throw new Error(`Unknown Response ${JSON.stringify(json)}`);
    });
  });
}

/**
 * ================================
 *              Main
 * ================================
 */
window.addEventListener('DOMContentLoaded', function () {
  /**
   * ================================
   *        Element References
   * ================================
   */
  let connectionStringInput = document.getElementById('connection-string');
  const connectButton = document.getElementById('connect');
  const resetCheckbox = document.getElementById('reset');
  const nameInput = document.getElementById('name');
  //const moduleCreditInput = document.getElementById('module-credit');
  const addButton = document.getElementById('add');
  const itemsTable = document.getElementById('items');
  // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
  const rowTemplate = document.querySelector('#module-row');
  //const gpaField = document.getElementById('gpa');

  // connectionStringInput = 'postgres://yshdissk:m0jHeWu5Em0APsrzchd0ws8GgcCkTZ0Y@fanny.db.elephantsql.com/yshdissk'
  /**
   * ================================
   *        Connect Button
   * ================================
   */

  
  connectButton.addEventListener('click', function () {
    // if (!connectionStringInput.reportValidity()) {
    //   return;
    // }
    //const connectionString = connectionStringInput.value;
  const connectionString = 'postgres://gwrbayww:8vrEY3OZ8H5Y3qY0JjX4mvwmXYzQB9Wg@fanny.db.elephantsql.com/gwrbayww'
    const isReset = resetCheckbox.checked;
    connectButton.disabled = true;
    connectToDatabase(connectionString, isReset)
      .then(function () {
        alert('Successfully connected to Database!');
      })
      .then(function () {
        return refreshModulesTable();
      })
      .catch(function (error) {
        alert(error);
      })
      .finally(function () {
        connectButton.disabled = false;
      });
  });

  /**
   * ================================
   *      Create Module Button
   * ================================
   */

  addButton.onclick = function () {
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reportValidity
    if (!nameInput.reportValidity()) {
      return;
    }
    const name = nameInput.value;
    //const moduleCredit = moduleCreditInput.value;
    addButton.disabled = true;
    createItem(name)
      .then(function () {
        alert('Successfully Created!');
      })
      .catch(function (error) {
        alert(error.message);
      })
      .finally(function () {
        refreshModulesTable();
        addButton.disabled = false;
      });
  };

  /**
   * ================================
   *     Module Table functions
   * ================================
   */
  function createItemRow(item) {
    // Ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
    const newRow = rowTemplate.content.cloneNode(true);

    newRow.querySelector('.row-module-id').textContent = item.id;
    newRow.querySelector('.row-module-code').textContent = item.name;
    //newRow.querySelector('.row-module-credit').textContent = module.moduleCredit;

    const statusSelect = newRow.querySelector('.row-module-grade');
    statusSelect.value = item.status || '';

    // Update and refresh table and GPA computation
    const updateButton = newRow.querySelector('.row-update');
    updateButton.onclick = function () {
      return updateItem(item.name, statusSelect.value)
        .then(function () {
          alert(`Update Successfully! ${item.name} -> ${statusSelect.value}`);
          return refreshModulesTable();
        })
        .catch(function (error) {
          alert(error.message);
        });
    };

    // Delete and refresh table and GPA computation
    const deleteButton = newRow.querySelector('.row-delete');
    deleteButton.onclick = function () {
      return deleteItem(item.name)
        .then(function () {
          alert(`Delete Successfully! ${item.name}`);
          return refreshModulesTable();
        })
        .catch(function (error) {
          alert(error.message);
        });
    };
    return newRow;
  }

  // Refresh table and GPA computation
  function refreshModulesTable() {
    return getItem()
    // .then((response) => {
    //   console.log("RESPONSE");
    //   console.log(response);
    // })
      .then(function (items) {
        itemsTable.innerHTML = '';
         items.forEach(function (item) {
           const moduleRow = createItemRow(item);
           itemsTable.appendChild(moduleRow);
         });

        // gpaField.innerHTML = '';
        // const gpa = calculateGpa(items);
        // gpaField.textContent = gpa;
      })
      .catch(function (error) {
        return alert(error.message);
      });
  }
});
