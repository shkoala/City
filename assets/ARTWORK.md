# Approved town artwork — 2026-11-10

town-map-20261110.webp is the user-approved 1448 × 1086 illustration, converted to WebP (quality 96). The camera, 14 places, streets, all 12 zebra crossings, joined civic row, outer residential scenery and trams retain the approved layout. No semantic raster edits were made for this release.

SHA-256: f25b92f00c3247f6aa588acd25f365af3fb41c41cf88f8724e9237b68268dbed.

scene-geometry.js traces the foreground silhouettes from this image. draw.js repaints the same map within those silhouettes for depth sorting and adds live traffic signals over four baked lamp faces. Cars and Cole use the same 1448 × 1086 world coordinates as the walking graph. Walking footprints refer to ground contact, not projected roofs.

The supplied ШКОАЛА logo and six Cole directional sprites remain from the earlier game. Legacy town-map.webp, side-pavements-v2.webp and bottom-pavement-v2.webp are retained in the repository but are not loaded by this edition or copied into its build.


## East cycle path — 2026-11-15

The requested replacement of the right tram corridor is stored separately in `east-cycleway-20261115.webp`. The built-in image generation editor used the approved map as the reference, removed the right tram, rails, overhead wires and shelter, and added an empty two-way teal cycle path with cream edge and centre markings. A second edit clears the lower cycle path of its obstructing tree planter. `scene.js` clips this replacement to the east corridor; the approved base and building silhouettes remain unchanged. The left tram is retained. The two helmeted cyclists and the parking inspector are SVG game actors; cyclists are animated on independent lanes by `cycling.js`.
