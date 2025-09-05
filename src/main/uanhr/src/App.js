import React from "react";

import NasUpload from "./components/NasUpload";
import Test_NasGallery from "./components/test_NasGallery";
import NasGallery from "./components/NasGallery";

function App() {
    return (
        <div>
            <div>유안앨범</div>

            <NasUpload />
            <NasGallery/>
        </div>
    );
}

export default App;
