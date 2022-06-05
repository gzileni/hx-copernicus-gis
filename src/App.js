import React from "react";
import Map from "./Map";
import { Layers, TileLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ToolsControl, ScaleControl, ZoomSlider } from "./Controls";

import 'bootstrap/dist/css/bootstrap.min.css';
import "ol/ol.css";
import "./App.css";

const App = () => {

  return (
    <div>
      <Map>
        <Layers>
          <TileLayer source={osm()} zIndex={0} />
        </Layers>
        <Controls>
          <FullScreenControl />
          <ZoomSlider />
          <ScaleControl />
          <ToolsControl />
        </Controls>
      </Map>
    </div>
  );
};

export default App;
