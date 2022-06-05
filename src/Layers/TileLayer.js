import { useContext, useEffect } from "react";
import MapContext from "../Map/MapContext";
import OLTileLayer from "ol/layer/Tile";
import TileWMS from 'ol/source/TileWMS';
import _ from 'lodash';

const TileLayer = ({ source, zIndex = 0 }) => {
	const { map, wms, wfs, epsg, extent } = useContext(MapContext);
	
	useEffect(() => {

		if (!map) return;

		let tileLayer = new OLTileLayer({
			source,
			zIndex,
		});
		
		map.addLayer(tileLayer);
		tileLayer.setZIndex(zIndex);
		
		_.forEach(wms, s => {
			/** get layer from services */
		
			_.forEach(s.layers, (layer, idx) => {
				/** add layers */
				const so = new OLTileLayer({
					extent: extent,
					source: new TileWMS({
						url: s.url,
						params: {
							'LAYERS': layer.key, 
							'TILED': true
						}
					})
				});
				so.set('id', layer.key);
				so.setVisible(false);
				map.addLayer(so);
				so.setZIndex(idx);
			})

			
		});

		return () => {
			if (map) {
				map.removeLayer(tileLayer);
			}
		};

	}, [epsg, extent, map, source, wfs, wms, zIndex]);

	return null;
};

export default TileLayer;
