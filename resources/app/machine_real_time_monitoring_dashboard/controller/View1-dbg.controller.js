sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/HTML",
], (
    Controller,Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    HTML
    ) => {
    "use strict";

    return Controller.extend("com.evoedge.machinerealtimemonitoringdashboard.controller.View1", {
        onInit: function () {
          Chart.register({
            id: "centerText",
            beforeDraw(chart) {
              const { width, height, ctx } = chart;
              ctx.restore();

              const text = chart.config.options.plugins.centerText?.text;
              const color =
                chart.config.options.plugins.centerText?.color || "#333";

              const fontSize = 32; // ⬅️ increase to 32px or more for larger text
              const yOffset = height / 1.55;

              ctx.font = `bold ${fontSize}px sans-serif`;
              ctx.fillStyle = color;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              ctx.fillText(text, width / 2, yOffset);
              ctx.save();
            },
          });

          const oChartModel = new sap.ui.model.json.JSONModel({ results: [] });
          this.getView().setModel(oChartModel, "chartModel");

          const oViewModel = new sap.ui.model.json.JSONModel({
            selectedMachineType: "",
          });
          this.getView().setModel(oViewModel, "viewModel");

          this.oChartReady = typeof Chart !== "undefined";
          this._chartInstances = {}; // add this in onInit

          this._startAutoRefresh();
        },

        onAfterRendering: function () {
          this.onSearch();
        },

        _startAutoRefresh: function () {
          setInterval(() => {
            this.refreshDataOnly();
          }, 5000);
        },

        //         onSearch: async function () {
        //           const oView = this.getView();
        //           const oModel = oView.getModel();
        //           const oViewModel = oView.getModel("viewModel");
        //           const sSelectedMachineType = oViewModel.getProperty(
        //             "/selectedMachineType"
        //           );

        //           oView.setBusy(true);

        //           try {
        //             const aFilters = sSelectedMachineType
        //               ? [
        //                   new Filter(
        //                     "Machine_Type",
        //                     FilterOperator.EQ,
        //                     sSelectedMachineType
        //                   ),
        //                 ]
        //               : [];

        //             const oBinding = oModel.bindList(
        //               "/MachineType",
        //               undefined,
        //               undefined,
        //               aFilters
        //             );
        //             const aContexts = await oBinding.requestContexts(0, 500);
        //             const aRawData = aContexts.map((ctx) => ctx.getObject());

        //             const oGroups = {};
        //             aRawData.forEach((machine) => {
        //               const type = machine.Machine_Type;
        //               if (!oGroups[type]) oGroups[type] = [];
        //               oGroups[type].push({
        //                 ...machine,
        //                 Value: parseFloat(machine.Value),
        //               });
        //             });

        //             const aGroups = Object.keys(oGroups).map((type, idx) => {
        //               const machines = oGroups[type];
        //               const total = machines.reduce((acc, m) => acc + m.Value, 0);
        //               const avgValue = Math.round(total / machines.length);

        //               let machineIdErrorList = [];

        //               const processedMachines = machines.map((m) => {
        //                 let icon = "decline";
        //                 let state = "Error";

        //                 if (m.Value < 200) {
        //                   icon = "accept";
        //                   state = "Success";
        //                 } else if (m.Value >= 200 && m.Value <= 239) {
        //                   icon = "alert";
        //                   state = "Warning";
        //                 } else {
        //                   machineIdErrorList.push(m.Machine_Id);
        //                 }

        //                 return {
        //                   Machine_Id: m.Machine_Id,
        //                   Value: m.Value,
        //                   measurement: m.Machine_Id.includes("WM") ? "Pr" : "Temp",
        //                   Icon: icon,
        //                   State: state,
        //                 };
        //               });

        //               return {
        //                 Machine_Type: type,
        //                 Machine_Type_Name: machines[0].Machine_Type_Name, // assuming all machines in the group have the same name
        //                 GaugeId: `chart_group_${idx}`,
        //                 AvgValue: avgValue,
        //                 Machines: processedMachines,
        //                 Machine_Id_Error_Id: machineIdErrorList.join(", "),
        //               };
        //             });

        //             const oGroupModel = new sap.ui.model.json.JSONModel({
        //               Groups: aGroups,
        //             });
        //             this.getView().setModel(oGroupModel, "groupModel");

        //             setTimeout(() => {
        //               aGroups.forEach((group) => {
        //                 const ctx = document
        //                   .getElementById(group.GaugeId)
        //                   ?.getContext("2d");
        //                 if (ctx) {
        //                   new Chart(ctx, {
        //                     type: "doughnut",
        //                     data: {
        //                       datasets: [
        //                         {
        //                           data: [group.AvgValue, 300 - group.AvgValue],
        //                           backgroundColor: ["#4caf50", "#e0e0e0"],
        //                           borderWidth: 0,
        //                         },
        //                       ],
        //                     },
        //                     options: {
        //                       rotation: -90,
        //                       circumference: 180,
        //                       cutout: "70%",
        //                       plugins: {
        //                         legend: { display: false },
        //                         tooltip: {
        //                         enabled: true,
        //                         callbacks: {
        //                             label: function (context) {
        //                             return `Average Value: ${context.dataset.data[0]}`;
        //                             }
        //                         }
        //                         }

        //                       },
        //                     },
        //                   });
        //                 }
        //               });
        //             }, 0);
        //           } catch (err) {
        //             MessageBox.error("Error loading data: " + err.message);
        //           } finally {
        //             oView.setBusy(false);
        //           }
        //         },

        //         refreshDataOnly: async function () {
        //           const oView = this.getView();
        //           const oModel = oView.getModel();
        //           const oGroupModel = oView.getModel("groupModel");
        //           const oViewModel = oView.getModel("viewModel");
        //           const sSelectedMachineType = oViewModel.getProperty(
        //             "/selectedMachineType"
        //           );

        //           try {
        //             const aFilters = sSelectedMachineType
        //               ? [
        //                   new Filter(
        //                     "Machine_Type",
        //                     FilterOperator.EQ,
        //                     sSelectedMachineType
        //                   ),
        //                 ]
        //               : [];

        //             const oBinding = oModel.bindList(
        //               "/MachineType",
        //               undefined,
        //               undefined,
        //               aFilters
        //             );
        //             const aContexts = await oBinding.requestContexts(0, 500);
        //             const aRawData = aContexts.map((ctx) => ctx.getObject());

        //             const oGroups = {};
        //             aRawData.forEach((machine) => {
        //               const type = machine.Machine_Type;
        //               if (!oGroups[type]) oGroups[type] = [];
        //               oGroups[type].push({
        //                 ...machine,
        //                 Value: parseFloat(machine.Value),
        //               });
        //             });

        //             const aGroups = oGroupModel.getProperty("/Groups");

        //             aGroups.forEach((group) => {
        //               const updatedMachines = oGroups[group.Machine_Type] || [];
        //               const machineIdErrorList = [];

        //               const newMachines = updatedMachines.map((m) => {
        //                 let icon = "decline",
        //                   state = "Error";
        //                 if (m.Value < 200) {
        //                   icon = "accept";
        //                   state = "Success";
        //                 } else if (m.Value >= 200 && m.Value <= 239) {
        //                   icon = "alert";
        //                   state = "Warning";
        //                 } else {
        //                   machineIdErrorList.push(m.Machine_Id);
        //                 }
        //                 return {
        //                   Machine_Id: m.Machine_Id,
        //                   Value: m.Value,
        //                   measurement: m.Machine_Id.includes("WM") ? "Pr" : "Temp",
        //                   Icon: icon,
        //                   State: state,
        //                 };
        //               });

        //               const total = updatedMachines.reduce(
        //                 (acc, m) => acc + m.Value,
        //                 0
        //               );
        //               const avgValue = Math.round(total / updatedMachines.length);

        //               group.Machines = newMachines;
        //               group.AvgValue = avgValue;
        //               group.Machine_Id_Error_Id = machineIdErrorList.join(", ");
        //             });

        //             oGroupModel.checkUpdate(true);

        //             // Refresh gauges after updating data
        //             setTimeout(() => {
        //               aGroups.forEach((group) => {
        //                 const ctx = document
        //                   .getElementById(group.GaugeId)
        //                   ?.getContext("2d");
        //                 if (ctx) {
        //                   // Destroy old chart instance if exists
        //                   if (group._chartInstance) {
        //                     group._chartInstance.destroy();
        //                   }

        //                   group._chartInstance = new Chart(ctx, {
        //                     type: "doughnut",
        //                     data: {
        //                       datasets: [
        //                         {
        //                           data: [group.AvgValue, 300 - group.AvgValue],
        //                           backgroundColor: ["#4caf50", "#e0e0e0"],
        //                           borderWidth: 0,
        //                         },
        //                       ],
        //                     },
        //                     options: {
        //                       rotation: -90,
        //                       circumference: 180,
        //                       cutout: "70%",
        //                       plugins: {
        //                         legend: { display: false },
        //                         tooltip: {
        //   enabled: true,
        //   callbacks: {
        //     label: function (context) {
        //       return `Average Value: ${context.dataset.data[0]}`;
        //     }
        //   }
        // }

        //                       },
        //                     },
        //                   });
        //                 }
        //               });
        //             }, 0);
        //           } catch (err) {
        //             console.error("Error refreshing data:", err.message);
        //           }
        //         },

        onSearch: async function () {
          const oView = this.getView();
          const oModel = oView.getModel();
          const oViewModel = oView.getModel("viewModel");
          const sSelectedMachineType = oViewModel.getProperty(
            "/selectedMachineType"
          );

          oView.setBusy(true);

          try {
            const aFilters = sSelectedMachineType
              ? [
                  new Filter(
                    "Machine_Type",
                    FilterOperator.EQ,
                    sSelectedMachineType
                  ),
                ]
              : [];

            const oBinding = oModel.bindList(
              "/MachineType",
              undefined,
              undefined,
              aFilters
            );
            const aContexts = await oBinding.requestContexts(0, 500);
            const aRawData = aContexts.map((ctx) => ctx.getObject());

            const oGroups = {};
            aRawData.forEach((machine) => {
              const type = machine.Machine_Type;
              if (!oGroups[type]) oGroups[type] = [];
              oGroups[type].push({
                ...machine,
                Value: parseFloat(machine.Value),
              });
            });

            const aGroups = Object.keys(oGroups).map((type, idx) => {
              const machines = oGroups[type];
              const total = machines.reduce((acc, m) => acc + m.Value, 0);
              const avgValue = Math.round(total / machines.length);

              let machineIdErrorList = [];

              const processedMachines = machines.map((m) => {
                const { Icon: icon, State: state } = this._determineState(
                  m.Machine_Id,
                  m.Value
                );
                if (state === "Error") {
                  machineIdErrorList.push(m.Machine_Id);
                }
                return {
                  Machine_Id: m.Machine_Id,
                  Value: m.Value,
                  measurement: m.Machine_Id.startsWith("WM") ? "Psi" : "°C",
                  Icon: icon,
                  State: state,
                };
              });

              return {
                Machine_Type: type,
                Machine_Type_Name: machines[0].Machine_Type_Name,
                GaugeId: `chart_group_${idx}`,
                AvgValue: avgValue,
                Machines: processedMachines,
                Machine_Id_Error_Id: machineIdErrorList.join(", "),
              };
            });

            const oGroupModel = new sap.ui.model.json.JSONModel({
              Groups: aGroups,
            });
            this.getView().setModel(oGroupModel, "groupModel");

            // setTimeout(() => {
            //   aGroups.forEach((group) => {
            //     const ctx = document
            //       .getElementById(group.GaugeId)
            //       ?.getContext("2d");
            //     if (ctx) {
            //       const color =
            //         group.AvgValue < 200
            //           ? "#4caf50"
            //           : group.AvgValue <= 239
            //           ? "#e9730c"
            //           : "#f44336";
            //       new Chart(ctx, {
            //         type: "doughnut",
            //         data: {
            //           datasets: [
            //             {
            //               data: [group.AvgValue, 300 - group.AvgValue],
            //               backgroundColor: [color, "#e0e0e0"],
            //               borderWidth: 0,
            //             },
            //           ],
            //         },
            //         options: {
            //           rotation: -90,
            //           circumference: 180,
            //           cutout: "70%",
            //           plugins: {
            //             legend: { display: false },
            //             tooltip: {
            //               enabled: true,
            //               callbacks: {
            //                 label: (context) => `Average: ${group.AvgValue}`,
            //               },
            //             },
            //           },
            //         },
            //       });
            //     }
            //   });
            // }, 0);
            setTimeout(() => {
              aGroups.forEach((group) => {
                const canvasId = group.GaugeId;
                const ctx = document.getElementById(canvasId)?.getContext("2d");

                if (ctx) {
                  // Destroy existing chart if exists
                  if (this._chartInstances[canvasId]) {
                    this._chartInstances[canvasId].destroy();
                  }

                  let color = "#f44336"; // Default to Error (red)

                  if (group.Machine_Type.startsWith("WM")) {
                    if (group.AvgValue >= 6 && group.AvgValue <= 7) {
                      color = "#4caf50"; // Green
                    } else if (group.AvgValue === 5 || group.AvgValue === 8) {
                      color = "#e9730c"; // Orange
                    }
                  } else if (group.Machine_Type.startsWith("BR")) {
                    if (group.AvgValue <= 800) {
                      color = "#4caf50";
                    } else if (group.AvgValue <= 850) {
                      color = "#e9730c";
                    }
                  } else if (group.Machine_Type.startsWith("CM")) {
                    if (group.AvgValue <= 1000) {
                      color = "#4caf50";
                    } else if (group.AvgValue <= 1050) {
                      color = "#e9730c";
                    }
                  }

                  // Create new chart
                  //   const chart = new Chart(ctx, {
                  //     type: "doughnut",
                  //     data: {
                  //       datasets: [
                  //         {
                  //           data: [group.AvgValue, 300 - group.AvgValue],
                  //           backgroundColor: [color, "#e0e0e0"],
                  //           borderWidth: 0,
                  //         },
                  //       ],
                  //     },
                  //     options: {
                  //       rotation: -90,
                  //       circumference: 180,
                  //       cutout: "70%",
                  //       plugins: {
                  //         legend: { display: false },
                  //         tooltip: {
                  //           enabled: true,
                  //           callbacks: {
                  //             label: () => `Average: ${group.AvgValue}`,
                  //           },
                  //         },
                  //       },
                  //     },
                  //   });

                  const maxValue = group.Machine_Type.startsWith("WM")
                    ? 20
                    : 300;

                  const chart = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                      datasets: [
                        {
                          data: [group.AvgValue, maxValue - group.AvgValue],
                          backgroundColor: [color, "#e0e0e0"],
                          borderWidth: 0,
                        },
                      ],
                    },
                    options: {
                      rotation: -90,
                      circumference: 180,
                      cutout: "70%",
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          enabled: true,
                          callbacks: {
                            label: () => `Average: ${group.AvgValue}`,
                          },
                        },
                        centerText: {
                          text: `${group.AvgValue} ${
                            group.Machine_Type.startsWith("WM") ? "Psi" : "°C"
                          }`,
                          color: color, // Match gauge color
                        },
                      },
                    },
                  });

                  // Save chart instance for future cleanup
                  this._chartInstances[canvasId] = chart;
                }
              });
            }, 0);
          } catch (err) {
            MessageBox.error("Error loading data: " + err.message);
          } finally {
            oView.setBusy(false);
          }
        },
        refreshDataOnly: async function () {
          const oView = this.getView();
          const oModel = oView.getModel();
          const oGroupModel = oView.getModel("groupModel");
          const oViewModel = oView.getModel("viewModel");
          const sSelectedMachineType = oViewModel.getProperty(
            "/selectedMachineType"
          );

          try {
            const aFilters = sSelectedMachineType
              ? [
                  new Filter(
                    "Machine_Type",
                    FilterOperator.EQ,
                    sSelectedMachineType
                  ),
                ]
              : [];

            const oBinding = oModel.bindList(
              "/MachineType",
              undefined,
              undefined,
              aFilters
            );
            const aContexts = await oBinding.requestContexts(0, 500);
            const aRawData = aContexts.map((ctx) => ctx.getObject());

            const oGroups = {};
            aRawData.forEach((machine) => {
              const type = machine.Machine_Type;
              if (!oGroups[type]) oGroups[type] = [];
              oGroups[type].push({
                ...machine,
                Value: parseFloat(machine.Value),
              });
            });

            const aGroups = oGroupModel.getProperty("/Groups");

            aGroups.forEach((group) => {
              const updatedMachines = oGroups[group.Machine_Type] || [];
              const machineIdErrorList = [];

              const newMachines = updatedMachines.map((m) => {
                const { Icon: icon, State: state } = this._determineState(
                  m.Machine_Id,
                  m.Value
                );
                if (state === "Error") {
                  machineIdErrorList.push(m.Machine_Id);
                }
                return {
                  Machine_Id: m.Machine_Id,
                  Value: m.Value,
                  measurement: m.Machine_Id.startsWith("WM") ? "Psi" : "°C",
                  Icon: icon,
                  State: state,
                };
              });

              const total = updatedMachines.reduce(
                (acc, m) => acc + m.Value,
                0
              );
              const avgValue = Math.round(total / updatedMachines.length);

              group.Machines = newMachines;
              group.AvgValue = avgValue;
              group.Machine_Id_Error_Id = machineIdErrorList.join(", ");
            });

            oGroupModel.checkUpdate(true);

            // 🟢 Re-render Gauges
            // setTimeout(() => {
            //   aGroups.forEach((group) => {
            //     const ctx = document
            //       .getElementById(group.GaugeId)
            //       ?.getContext("2d");
            //     if (ctx) {
            //       const color =
            //         group.AvgValue < 200
            //           ? "#4caf50"
            //           : group.AvgValue <= 239
            //           ? "#e9730c"
            //           : "#f44336";
            //       new Chart(ctx, {
            //         type: "doughnut",
            //         data: {
            //           datasets: [
            //             {
            //               data: [group.AvgValue, 300 - group.AvgValue],
            //               backgroundColor: [color, "#e0e0e0"],
            //               borderWidth: 0,
            //             },
            //           ],
            //         },
            //         options: {
            //           rotation: -90,
            //           circumference: 180,
            //           cutout: "70%",
            //           plugins: {
            //             legend: { display: false },
            //             tooltip: {
            //               enabled: true,
            //               callbacks: {
            //                 label: (context) => `Average: ${group.AvgValue}`,
            //               },
            //             },
            //           },
            //         },
            //       });
            //     }
            //   });
            // }, 0);

            setTimeout(() => {
              aGroups.forEach((group) => {
                const canvasId = group.GaugeId;
                const ctx = document.getElementById(canvasId)?.getContext("2d");

                if (ctx) {
                  // Destroy existing chart if exists
                  if (this._chartInstances[canvasId]) {
                    this._chartInstances[canvasId].destroy();
                  }

                  let color = "#f44336"; // Default to Error (red)

                  if (group.Machine_Type.startsWith("WM")) {
                    if (group.AvgValue >= 6 && group.AvgValue <= 7) {
                      color = "#4caf50"; // Green
                    } else if (group.AvgValue === 5 || group.AvgValue === 8) {
                      color = "#e9730c"; // Orange
                    }
                  } else if (group.Machine_Type.startsWith("BR")) {
                    if (group.AvgValue <= 800) {
                      color = "#4caf50";
                    } else if (group.AvgValue <= 850) {
                      color = "#e9730c";
                    }
                  } else if (group.Machine_Type.startsWith("CM")) {
                    if (group.AvgValue <= 1000) {
                      color = "#4caf50";
                    } else if (group.AvgValue <= 1050) {
                      color = "#e9730c";
                    }
                  }

                  // Create new chart
                  //   const chart = new Chart(ctx, {
                  //     type: "doughnut",
                  //     content: ["0" + " %", "CPU utilization"],
                  //     data: {
                  //       datasets: [
                  //         {
                  //           data: [group.AvgValue, 300 - group.AvgValue],
                  //           backgroundColor: [color, "#e0e0e0"],
                  //           borderWidth: 0,
                  //         },
                  //       ],
                  //     },
                  //     options: {
                  //       rotation: -90,
                  //       circumference: 180,
                  //       cutout: "70%",
                  //       plugins: {
                  //         legend: { display: false },
                  //         tooltip: {
                  //           enabled: true,
                  //           callbacks: {
                  //             label: () => `Average: ${group.AvgValue}`,
                  //           },
                  //         },
                  //       },
                  //     },
                  //   });

                  const maxValue = group.Machine_Type.startsWith("WM")
                    ? 20
                    : 300;
                  const chart = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                      datasets: [
                        {
                          data: [group.AvgValue, maxValue - group.AvgValue],
                          backgroundColor: [color, "#e0e0e0"],
                          borderWidth: 0,
                        },
                      ],
                    },
                    options: {
                      rotation: -90,
                      circumference: 180,
                      cutout: "70%",
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          enabled: true,
                          callbacks: {
                            label: () => `Average: ${group.AvgValue}`,
                          },
                        },
                        centerText: {
                          text: `${group.AvgValue} ${
                            group.Machine_Type.startsWith("WM") ? "Psi" : "°C"
                          }`,
                          color: color, // Match gauge color
                        },
                      },
                    },
                  });

                  // Save chart instance for future cleanup
                  this._chartInstances[canvasId] = chart;
                }
              });
            }, 0);
          } catch (err) {
            console.error("Error refreshing data:", err.message);
          }
        },
        _determineState: function (id, val) {
          if (id.startsWith("WM")) {
            if (val >= 6 && val <= 7)
              return { Icon: "accept", State: "Success" };
            if (val === 5 || val === 8)
              return { Icon: "alert", State: "Warning" };
            return { Icon: "decline", State: "Error" };
          } else if (id.startsWith("BR")) {
            if (val <= 800) return { Icon: "accept", State: "Success" };
            if (val <= 850) return { Icon: "alert", State: "Warning" };
            return { Icon: "decline", State: "Error" };
          } else if (id.startsWith("CM")) {
            if (val <= 1000) return { Icon: "accept", State: "Success" };
            if (val <= 1050) return { Icon: "alert", State: "Warning" };
            return { Icon: "decline", State: "Error" };
          }
          return { Icon: "question-mark", State: "None" };
        },
      });
});