// Sincroniza el valor del input range de plazo
document.addEventListener("DOMContentLoaded", function () {
  // Cargar datos de LocalStorage si existen
  const fields = [
    "correo",
    "nombre",
    "fechaNacimiento",
    "salario",
    "tasaInteres",
    "plazo",
    "valorVivienda",
    "montoSolicitar",
  ];
  fields.forEach((id) => {
    const val = localStorage.getItem("credito_" + id);
    if (val !== null && document.getElementById(id)) {
      document.getElementById(id).value = val;
      if (id === "plazo")
        document.getElementById("plazoValue").textContent = val;
    }
  });

  const plazoInput = document.getElementById("plazo");
  if (plazoInput) {
    plazoInput.addEventListener("input", function () {
      document.getElementById("plazoValue").textContent = this.value;
    });
  }

  // Limita el monto a solicitar al 80% del valor de la vivienda
  const valorViviendaInput = document.getElementById("valorVivienda");
  if (valorViviendaInput) {
    valorViviendaInput.addEventListener("input", function () {
      const valor = parseFloat(this.value) || 0;
      const maxMonto = valor * 0.8;
      const montoSolicitar = document.getElementById("montoSolicitar");
      montoSolicitar.max = maxMonto;
      if (parseFloat(montoSolicitar.value) > maxMonto) {
        montoSolicitar.value = maxMonto;
      }
    });
  }

  // Guardar datos en LocalStorage al cambiar
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", function () {
        localStorage.setItem("credito_" + id, this.value);
      });
    }
  });

  // Calculadora de crédito hipotecario y proyección
  const form = document.getElementById("creditoForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Obtener datos
      const correo = document.getElementById("correo").value;
      const nombre = document.getElementById("nombre").value;
      const fechaNacimiento = document.getElementById("fechaNacimiento").value;
      const salario = parseFloat(document.getElementById("salario").value);
      const tasaInteresAnual = parseFloat(
        document.getElementById("tasaInteres").value
      );
      const plazoAnios = parseInt(document.getElementById("plazo").value);
      const valorVivienda = parseFloat(
        document.getElementById("valorVivienda").value
      );
      const montoSolicitar = parseFloat(
        document.getElementById("montoSolicitar").value
      );

      // Validación de monto a solicitar
      const maxMonto = valorVivienda * 0.8;
      if (montoSolicitar > maxMonto) {
        alert(
          "El monto a solicitar no puede ser mayor al 80% del valor de la vivienda."
        );
        return;
      }

      // a. Cálculo del pago mensual (pm)
      // tm = tasa mensual = tasa anual / 12
      const tm = tasaInteresAnual / 12;
      const p = plazoAnios * 12;
      let pm;
      if (tm === 0) {
        pm = montoSolicitar / p;
      } else {
        const tm100 = tm / 100;
        pm = (montoSolicitar * tm100) / (1 - Math.pow(1 + tm100, -p));
      }

      // b. Mostrar en input text el monto del pago mensual
      document.getElementById("pagoMensual").value = pm.toFixed(2);

      // c. Mostrar en input text el salario mínimo requerido
      const salarioMinimo = pm / 0.4;
      document.getElementById("salarioMinimo").value = salarioMinimo.toFixed(2);

      // d. Mostrar etiqueta de suficiencia de salario
      const etiquetaSalario = document.getElementById("etiquetaSalario");
      if (salario >= salarioMinimo) {
        etiquetaSalario.textContent =
          "Monto de salario suficiente para el crédito";
        etiquetaSalario.className = "fw-bold text-success";
      } else {
        etiquetaSalario.textContent = "Monto de salario insuficiente";
        etiquetaSalario.className = "fw-bold text-danger";
      }

      // e. Evaluar edad
      const etiquetaEdad = document.getElementById("etiquetaEdad");
      let edad = 0;
      if (fechaNacimiento) {
        const hoy = new Date();
        const fnac = new Date(fechaNacimiento);
        edad = hoy.getFullYear() - fnac.getFullYear();
        const m = hoy.getMonth() - fnac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fnac.getDate())) {
          edad--;
        }
      }
      if (edad >= 22 && edad <= 55) {
        etiquetaEdad.textContent = "Cliente con edad suficiente para crédito";
        etiquetaEdad.className = "fw-bold text-success";
      } else {
        etiquetaEdad.textContent = "Cliente no califica para crédito por edad";
        etiquetaEdad.className = "fw-bold text-danger";
      }

      // f. Mostrar porcentaje a financiar
      const porcentaje = (montoSolicitar / valorVivienda) * 100;
      document.getElementById("porcentajeFinanciar").value =
        porcentaje.toFixed(2);

      // g. Guardar todos los datos necesarios en LocalStorage
      fields.forEach((id) => {
        localStorage.setItem(
          "credito_" + id,
          document.getElementById(id).value
        );
      });
      // También guardar los resultados
      localStorage.setItem("credito_pagoMensual", pm.toFixed(2));
      localStorage.setItem("credito_salarioMinimo", salarioMinimo.toFixed(2));
      localStorage.setItem(
        "credito_porcentajeFinanciar",
        porcentaje.toFixed(2)
      );
      localStorage.setItem(
        "credito_etiquetaSalario",
        etiquetaSalario.textContent
      );
      localStorage.setItem("credito_etiquetaEdad", etiquetaEdad.textContent);

      // Mostrar resultados en LocalStorage al recargar
      document.getElementById("pagoMensual").value =
        localStorage.getItem("credito_pagoMensual") || "";
      document.getElementById("salarioMinimo").value =
        localStorage.getItem("credito_salarioMinimo") || "";
      document.getElementById("porcentajeFinanciar").value =
        localStorage.getItem("credito_porcentajeFinanciar") || "";
      document.getElementById("etiquetaSalario").textContent =
        localStorage.getItem("credito_etiquetaSalario") || "";
      document.getElementById("etiquetaEdad").textContent =
        localStorage.getItem("credito_etiquetaEdad") || "";
    });
  }

  // Botón Mostrar Proyección
  const btnProyeccion = document.getElementById("btnProyeccion");
  if (btnProyeccion) {
    btnProyeccion.addEventListener("click", function () {
      // Obtener datos actuales del formulario
      const montoSolicitar = parseFloat(
        document.getElementById("montoSolicitar").value
      );
      const tasaInteresAnual = parseFloat(
        document.getElementById("tasaInteres").value
      );
      const plazoAnios = parseInt(document.getElementById("plazo").value);

      if (
        isNaN(montoSolicitar) ||
        isNaN(tasaInteresAnual) ||
        isNaN(plazoAnios)
      ) {
        document.getElementById("tablaProyeccion").innerHTML =
          '<div class="alert alert-warning">Complete los datos y calcule primero.</div>';
        return;
      }

      const tm = tasaInteresAnual / 12;
      const p = plazoAnios * 12;
      let pm;
      if (tm === 0) {
        pm = montoSolicitar / p;
      } else {
        const tm100 = tm / 100;
        pm = (montoSolicitar * tm100) / (1 - Math.pow(1 + tm100, -p));
      }

      let saldo = montoSolicitar;
      let tabla = `<div class="table-responsive"><table class="table table-bordered table-striped align-middle">
        <thead class="table-light">
          <tr>
            <th>Mes</th>
            <th>Pago Mensual</th>
            <th>Intereses</th>
            <th>Amortización</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>`;
      for (let mes = 1; mes <= p; mes++) {
        const tm100 = tm / 100;
        const interesMes = saldo * tm100;
        const amortizacion = pm - interesMes;
        saldo = saldo - amortizacion;
        tabla += `<tr>
          <td>${mes}</td>
          <td class="text-end">${pm.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</td>
          <td class="text-end">${interesMes.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</td>
          <td class="text-end">${amortizacion.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</td>
          <td class="text-end">${
            saldo > 0
              ? saldo.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"
          }</td>
        </tr>`;
        if (saldo <= 0) break;
      }
      tabla += `</tbody></table></div>`;
      document.getElementById("tablaProyeccion").innerHTML = tabla;
    });
  }
});
