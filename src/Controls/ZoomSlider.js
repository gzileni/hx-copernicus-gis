import { useContext, useEffect } from "react";
import {ZoomSlider as zoom} from 'ol/control';
import MapContext from "../Map/MapContext";

const ZoomSlider = () => {
	const { map } = useContext(MapContext);

	useEffect(() => {
		if (!map) return;

		const zoomslider = new zoom({
            className: 'ol-zoomslider'
        });
        map.addControl(zoomslider);

		return () => map.controls.remove(zoomslider);
	}, [map]);

	return null;
};

export default ZoomSlider;