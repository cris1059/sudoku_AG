const miPromesa = new Promise((resolve, reject) => {
    setTimeout(() => {
      let exito = true; // Simular éxito
  
      if (exito) {
        resolve("Datos recibidos correctamente.");
      } else {
        reject("Error al obtener los datos.");
      }
    }, 2000); // Simulamos una operación que tarda 2 segundos
  });
  
  miPromesa
    .then((mensaje) => {
      console.log(mensaje); // "Datos recibidos correctamente."
    })
    .catch((error) => {
      console.log(error); // "Error al obtener los datos."
    });
  