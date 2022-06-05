import { useContext, useEffect } from "react";
import { ScaleLine } from 'ol/control';
import MapContext from "../Map/MapContext";

const ScaleControl = () => {
	const { map } = useContext(MapContext);

	useEffect(() => {
		if (!map) return;

		let scaleControl = new ScaleLine({
            units: 'metric',
            bar: true,
            steps: 4,
            text: true,
            minWidth: 140,
        });

		map.controls.push(scaleControl);

		return () => map.controls.remove(scaleControl);
	}, [map]);

	return null;
};

export default ScaleControl;