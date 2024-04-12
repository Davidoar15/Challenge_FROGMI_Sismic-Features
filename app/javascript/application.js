document.addEventListener("DOMContentLoaded", async function () {
  const filtersForm = document.getElementById("filters-form");
  const paginationButtons = document.getElementById("pagination-buttons");
  const featuresContainer = document.getElementById("features-container");

  // Manejar la solicitud inicial y mostrar las características
  handleInitialFetch();

  filtersForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleInitialFetch();
  });

  async function handleInitialFetch() {
    const magType = document.getElementById("mag-type-filter").value;
    const perPage = parseInt(document.getElementById("per-page-filter").value);
    const page = parseInt(document.getElementById("page-filter").value);

    const url = `api/features/all?filters[mag_type]=${magType}&per_page=${perPage}&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.data.length > 0) {
      renderFeatures(data);
      renderPaginationButtons(data.pagination);
      document.getElementById("no-features-msg").style.display = "none";
    } else {
      document.getElementById("features-container").innerHTML = "";
      paginationButtons.innerHTML = "";
      document.getElementById("no-features-msg").style.display = "block";
    }
  }

  function renderFeatures(data) {
    // Limpiar el contenedor de características
    featuresContainer.innerHTML = "";

    // Iterar sobre las características y agregarlas al contenedor
    data.data.forEach((feature) => {
      // Crear elemento HTML para mostrar la característica
      const featureElement = document.createElement("details");
      featureElement.classList.add("feature");

      const mag_type = feature.attributes.mag_type.toUpperCase();
      let longitude = (parseFloat(feature.attributes.coordinates.longitude) * -1).toFixed(2);
      let latitude = (parseFloat(feature.attributes.coordinates.latitude)).toFixed(2);

      featureElement.innerHTML = `
        <summary>${feature.attributes.title}</summary>
        <section class="content">
          <h3>Características</h3>
          <ul>
            <li><strong>Magnitud: </strong>${
              feature.attributes.magnitude
            } ${mag_type}</li>
            <li><strong>Coordenadas: </strong>${
              latitude > 0 ? latitude + "º Este" : latitude + "º Oeste"
            } | ${longitude > 0 ? longitude + "º Sur" : longitude*-1 + "º Norte"}</li>
            <li><a href="${
              feature.links.external_url
            }"><strong>Más Detalles Aquí</strong></a></li>
          </ul>
          <h3>Comentarios</h3>
          <div id="comments-container-${feature.id}" class="comments">
            Cargando comentarios...
          </div>
          <form id="comment-form-${feature.id}" class="comment-form">
            <textarea id="comment-text-${
              feature.id
            }" rows="4" cols="50" placeholder="Escribe tu comentario..."></textarea>
            <button id="comment-btn-${
              feature.id
            }" type="submit" disabled>Comentar</button>
          </form>
        </section>
    `;

      // Agregar los detalles de la característica al contenedor
      featuresContainer.appendChild(featureElement);

      // Obtener el contenedor de comentarios
      const commentsContainer = document.getElementById(
        `comments-container-${feature.id}`
      );

      // Solicitar y mostrar comentarios
      fetchFeaturesComments(feature.id)
        .then((commentsHTML) => {
          commentsContainer.innerHTML = commentsHTML;
        })
        .catch((error) => {
          console.error("Error fetching comments:", error);
        });

      const commentTextarea = document.getElementById(
        `comment-text-${feature.id}`
      );
      const commentButton = document.getElementById(
        `comment-btn-${feature.id}`
      );

      commentTextarea.addEventListener("input", function () {
        commentButton.disabled = !commentTextarea.value.trim();
      });

      const commentForm = document.getElementById(`comment-form-${feature.id}`);
      commentForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const commentText = commentTextarea.value.trim();

        if (commentText) {
          sendComment(feature.id, commentText)
            .then(() => {
              alert("¡Comentario enviado correctamente!");
              fetchFeaturesComments(feature.id)
                .then((commentsHTML) => {
                  commentsContainer.innerHTML = commentsHTML;
                })
                .catch((error) => {
                  console.error("Error fetching comments: ", error);
                });
            })
            .catch((error) => {
              alert(
                "Error al enviar el comentario. Por favor, intenta de nuevo."
              );
              console.error("Error sending comment: ", error);
            });
          commentTextarea.value = "";
          commentButton.disabled = true;
        }
      });
    });
  }

  function renderPaginationButtons(pagination) {
    // Limpiar los botones de paginación
    paginationButtons.innerHTML = "";

    // Calcular la cantidad de páginas y la página actual
    const totalPages = Math.ceil(pagination.total / pagination.per_page);
    const currentPage = pagination.current_page;

    // Definir el rango de botones a mostrar
    const range = 2; // Mostrar 2 botones antes y después de la página actual

    // Mostrar botones de páginas dentro del rango
    for (let i = currentPage - range; i <= currentPage + range; i++) {
      if (i > 0 && i <= totalPages) {
        addButton(i, i === currentPage); // Resaltar el botón de la página actual
      }
    }
  }

  function addButton(pageNumber, isActive = false) {
    const button = document.createElement("button");
    button.textContent = pageNumber;
    if (isActive) {
      button.classList.add("active"); // Agregar clase para resaltar el botón activo
    }
    button.addEventListener("click", async function () {
      const perPage = parseInt(
        document.getElementById("per-page-filter").value
      );
      const response = await fetch(
        `/api/features/all?per_page=${perPage}&page=${pageNumber}`
      );
      const data = await response.json();
      renderFeatures(data);
      renderPaginationButtons(data.pagination);
    });
    paginationButtons.appendChild(button);
  }
});

async function fetchFeaturesComments(id) {
  const response = await fetch(`/api/features/${id}`);
  const data = await response.json();
  if (data.data.comments.length === 0) {
    return `<ul><li>No hay comentarios</li></ul>`;
  } else {
    const commentsHTML = data.data.comments
      .map((comment) => `<li>${comment.body}</li>`)
      .join("");
    return `<ul>${commentsHTML}</ul>`;
  }
}

async function sendComment(featureId, commentBody) {
  try {
    const body = JSON.stringify({
      comment: {
        body: commentBody,
      },
    });

    const response = await fetch(`/api/features/${featureId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error("No se pudo enviar el comentario");
    }
  } catch (error) {
    console.log("ERROR", error);
  }
}
