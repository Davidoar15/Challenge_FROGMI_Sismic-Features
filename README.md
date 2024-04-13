# FROGMI CHALLENGE | Sismic - DATA

Sismic - DATA nace del desafío técnico planteado por Frogmi ®, cuyos puntos se describen a continuación.

# DESCRIPCIÓN DEL DESAFÍO:

## Objetivos:

- Desarrollar una aplicación en Ruby, o framework basado en Ruby, que contemple una Task para obtener y persistir datos, y una API que exponga dos endpoints que serán consultados desde un cliente externo.
- Desarrollar una página web simple en HTML5 y Javascript que permita consultar los dos endpoints que expondrá la API mencionada anteriormente. 

## Desarrollo Back End:

* Se espera el desarrollo de una aplicación en Ruby o framework basado en Ruby que obtenga y entregue información relacionada con datos sismológicos en el mundo. A grandes rasgos se espera que contemple una Task para obtener y persistir datos y dos endpoints que serán consultados desde un cliente externo.

* Obtención de datos desde feed y persistencia:
    - Desarrollar una Task que permita obtener data sismológica desde el sitio USGS (earthquake.usgs.gov). Específicamente por cada elemento: `id`, `properties.mag`, `properties.place`, `properties.time`, `properties.url`, `properties.tsunami`, `properties.magType`, `properties.title`, `geometry.coordinates[0]` (longitude) y `geometry.coordinates[1]` (latitude).
    - Es necesario persistir esta data en BD. Considerar: 
        - Los valores de `title`, `url`, `place`, `magType` y coordinates no pueden ser nulos. En caso contrario no persistir.
        - Validar rangos para magnitude [-1.0, 10.0], latitude [-90.0, 90.0] y longitude: [-180.0, 180.0]
        - No deben duplicarse registros si se lanza la Task más de una vez.

* Disponibilizar datos a través de una API REST:
    - Se espera que se desarrollen dos endpoints para exponer la data y modificar data:
        - Endpoint 1: GET lista de Features.
            - Los resultados deben exponerse siguiendo el siguiente formato:
            ```
            {
                "data": [
                    {
                        "id": Integer,
                        "type": "feature",
                        "attributes": {
                            "external_id": String,
                            "magnitude": Decimal,
                            "place": String,
                            "time": String,
                            "tsunami": Boolean,
                            "mag_type": String,
                            "title": String,
                            "coordinates": {
                                "longitude": Decimal,
                                "latitude": Decimal
                            }
                        },
                        "links": {
                            "external_url": String
                        }
                    }
                ],
                "pagination": {
                    "current_page": Integer,
                    "total": Integer,
                    "per_page": Integer
                }
            }
            ```
            - La data debe poder ser filtrada por:
                - `mag_type`. Using filters[mag_type]. Puede ser más de uno. Valores posibles: md, ml, ms, mw, me, mi, mb, mlg.
                - `page`
                - `per_page`. Validar `per_page <= 1000`.

        - Endpoint 2: POST crear un Comment asociado a un Feature.
            - Este endpoint debe recibir un payload que considere la siguiente información para crear un comentario relacionado con el Feature:
                - Un feature puede tener uno o más comments, pero solo se crea uno a la vez (por request).
                - El payload debe contener un `feature_id: Integer` que hace referencia al `id` interno de un feature y un `body: Text` con el comentario ingresado.
                - Se debe persistir cada comment recibido por este endpoint.
                - Se debe validar que existe contenido en el body del nuevo comentario antes de ser persistido.

## FLUJO DEL PROYECTO:

* Se decidió emplear el framework Ruby on Rails para afrontar el desafío en su totalidad.

1. Se crean los modelos y tablas en la base de datos nativa de Ruby on Rails (SQLite) para alojar los registros de cada Feature y Comment.
2. `lib/tasks/get_sismic_data.rake`. Se crea la Task para traer la data solicitada y registrar cada nueva Feature que cumpla con las restricciones planteadas. Esta Task puede ser disparada en la terminal utilizando el comando `rails data:fetch_sismic_data`.
3. `app/controllers/features_controller.rb` | `app/controllers/comments_controller.rb`. Se crean los controladores para cada ruta Backend que permita hacer solicitudes a la API (GET y POST).
4. `config/routes.rb`. Se definen las rutas para las solicitudes:
    * `GET: http://127.0.0.1:3000/api/features/all?filters[mag_type]=${magType}&per_page=${perPage}&page=${page}` 
        Permite traer todas las Features registradas en la BD. Basta con la forma `http://127.0.0.1:3000/api/features/all`, pero pueden ser agregados los filtros solicitados `mag_type`, `per_page`, `page` en cualquier orden y sin necesidad de colocarlos todos, por ejemplo:
        * `http://127.0.0.1:3000/api/features/all?per_page=3&page=1&filters[mag_type]=mb`
        * RESPONSE
        ```
        {
            "data": [
                {
                    "id": 49034,
                    "type": "feature",
                    "attributes": {
                        "external_id": null,
                        "magnitude": "2.2",
                        "place": "5 km NE of Whitehouse Station, New Jersey",
                        "time": "2024-04-07 15:35:13 UTC",
                        "tsunami": false,
                        "mag_type": "mb_lg",
                        "title": "M 2.2 - 5 km NE of Whitehouse Station, New Jersey",
                        "coordinates": {
                            "longitude": "-74.7305",
                            "latitude": "40.6568"
                        }
                    },
                    "links": {
                        "external_url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000mamj"
                    }
                },
                {
                    "id": 49163,
                    "type": "feature",
                    "attributes": {
                        "external_id": null,
                        "magnitude": "3.3",
                        "place": "61 km NNW of Saint-Boniface, Canada",
                        "time": "2024-04-07 04:39:00 UTC",
                        "tsunami": false,
                        "mag_type": "mb_lg",
                        "title": "M 3.3 - 61 km NNW of Saint-Boniface, Canada",
                        "coordinates": {
                            "longitude": "-76.2258",
                            "latitude": "47.0315"
                        }
                    },
                    "links": {
                        "external_url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000majq"
                    }
                },
                {
                    "id": 49346,
                    "type": "feature",
                    "attributes": {
                        "external_id": null,
                        "magnitude": "2.5",
                        "place": "7 km WSW of Gladstone, New Jersey",
                        "time": "2024-04-06 10:46:39 UTC",
                        "tsunami": false,
                        "mag_type": "mb_lg",
                        "title": "M 2.5 - 7 km WSW of Gladstone, New Jersey",
                        "coordinates": {
                            "longitude": "-74.7444",
                            "latitude": "40.6941"
                        }
                    },
                    "links": {
                        "external_url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000mafe"
                    }
                }
            ],
            "pagination": {
                "current_page": 1,
                "total": 15,
                "per_page": 3
            }
        }
        ```
    * `POST: http://127.0.0.1:3000/api/features/:feature_id/comments` 
        Permite crear un nuevo Comment el cual estará relacionado a una Feature específica, según su ID pasada por parámetro.
        * `http://127.0.0.1:3000/api/features/48745/comments`
        * BODY
        ```
        {
            "comment": {
                "body": "Este es un comentario de prueba. 13/04"
            }
        }
        ```
        * RESPONSE
        ```
        {
            "id": 13,
            "body": "Este es un comentario de prueba. 13/04",
            "created_at": "2024-04-13T21:15:48.023Z",
            "updated_at": "2024-04-13T21:15:48.023Z",
            "feature_id": 48745
        }
        ```
    * `GET: http://127.0.0.1:3000/api/features/:feature_id` 
        Permite traer una sola Feature mediante su ID recibido por parámetro en la petición, obteniendo también sus Comment en la respuesta. 
        * `http://127.0.0.1:3000/api/features/48745`
        * RESPONSE
        ```
        {
            "data": {
                "id": 48745,
                "attributes": {
                    "magnitude": "0.95",
                    "mag_type": "md",
                    "title": "M 1.0 - 8 km NW of The Geysers, CA",
                    "coordinates": {
                        "longitude": "-122.8190002",
                        "latitude": "38.8349991"
                    }
                },
                "comments": [
                    {
                        "body": "Este es un comentario de prueba. 09/04"
                    },
                    {
                        "body": "Este es un comentario de prueba. 10/04"
                    },
                    {
                        "body": "Este es un comentario de prueba. 13/04"
                    },
                ]
            }
        }
        ```
5. Desarrollo Frontend:
    * `app/views/inicio/index.html.erb` | `app/assets/stylesheets/application.css` | `app/javascript/application.js`
    * Se optó por emplear HTML, CSS y JS para desarrollar una Vista que le permita al usuario interactuar con la información del proyecto.
    * Características:
        * Apenas la página carga se muestran los 10 primeros Feature, presentados en la primera página. 
        * El usuario puede abrir una Feature y observar un par de características, redirigirse a la página oficial de USGS para más detalles y escribir un comentario el cual al ser cargado correctamente se mostrará en la Feature.
        * Es posible filtrar la información y moverse entre páginas.
        * Diseño Responsive.

# GRACIAS POR LEER