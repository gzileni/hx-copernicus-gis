import React, { useRef, useState, useEffect } from "react"
import "./Map.css";
import MapContext from "./MapContext";
import ListLayers from "./ListLayers";
import Geocoding from "./Geocoding";
import Query from './Query'

import * as ol from "ol";
import axios from 'axios';

let mapObject;

let config = {
  method: 'get',
  url: '/gs/catalog/puglia',
  headers: { },
  timeout: 10000,
  maxRedirects: 0
};

const Map = ({ children}) => {
	
	const mapRef = useRef();
	const [map, setMap] = useState(null);
	const [view, setView] = useState(null);
	const [wms, setWms] = useState(null);
	const [center, setCenter] = useState([]);
	const [extent, setExtent] = useState([]);
	const [extentCurrent, setExtentCurrent] = useState([]);
	const [epsg, setEpsg] = useState([]);
	const [zoom] = useState(9);
	const [visibleLayers, setVisibleLayers] = useState(false);
	const [visibleGeocode, setVisibleGeoCode] = useState(false);
	const [visibleQuery, setVisibleQuery] = useState(false);
	
	/**
	 * 
	 */
	const onOpenLayers = () => {
		setVisibleGeoCode(false);
		setVisibleLayers(!visibleLayers);
    }

	/**
	 * 
	 */
	const onGeoCode = () => {
		setVisibleLayers(false);
		setVisibleGeoCode(!visibleGeocode);
	}

	/**
	 * 
	 */
	const onQuery = () => {
		setVisibleLayers(false);
		setVisibleGeoCode(false);
		setVisibleQuery(!visibleQuery);
	}

	// on component mount
	useEffect(() => {

		axios(config).then((response) => {

			const data = response.data[0];

			setWms(data.wms);
			setCenter(data.center);
			setEpsg(data.epsg);
			setExtent(data.extent);

            const options_view = {
				projection: data.epsg,
				zoom: zoom,
				center: data.center
			}

			const v = new ol.View(options_view);
			setView(v);

			let options = {
				view: v,
				layers: [],
				controls: [],
				overlays: []
			};

			let mapObject = new ol.Map(options);
			mapObject.setTarget(mapRef.current);
			setMap(mapObject);

        }).catch(function (error) {
			// TODO:
            console.log(error);
        });
		
		return () => mapObject.setTarget(undefined);
	}, [zoom]);

	useEffect(() => {
		if (!map) return;
		map.on('singleclick', (event) => {
			// TODO:
			console.log('pixel click: ' + event.pixel);
			console.log('pixel coordinate: ' + event.coordinate)
		});
	}, [map]);

	useEffect(() => {
		if (!map) return;
		map.on('moveend', (event) => {
			const currentExtent = map.getView().calculateExtent(map.getSize())
			setExtentCurrent(currentExtent)
		});
	}, [map]);

 	/** zoom change handler */
	useEffect(() => {
		if (!map) return;
		map.getView().setZoom(zoom);
	}, [map, zoom]);

 	/** center change handler */
	useEffect(() => {
		if (!map) return;
		map.getView().setCenter(center)
	}, [center, map])

	return (
		<MapContext.Provider value={{ map, wms, epsg, extent, onOpenLayers, onGeoCode, onQuery }}>
			<div ref={mapRef} className="ol-map">
				{children}
			</div>
			{ visibleLayers  ? <ListLayers map={map} service={wms} /> : null }
			{ visibleGeocode ? <Geocoding view={view} /> : null }
			{ visibleQuery ? <Query map={map} extent={extentCurrent} view={view} /> : null }
		</MapContext.Provider>
	)
}

export default Map;