import { useEffect, useState, cloneElement, ReactElement } from "react";
import { Modal, Button } from "antd";
import { PushpinOutlined } from "@ant-design/icons";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const MapModal = ({
  storeLocation,
  CustomButton,
  defaultLocation,
}: {
  storeLocation?: (location: [number, number]) => void;
  CustomButton?: ReactElement;
  defaultLocation?: [number, number];
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([51.505, -0.09]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(defaultLocation ?? userLocation);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setSelectedLocation(defaultLocation ?? [latitude, longitude]);
      },
      () => {
        console.error("Unable to retrieve user's location");
      }
    );
  }, [defaultLocation]);

  const showModal = () => {
    setIsModalVisible(true);
    if (defaultLocation) {
      setSelectedLocation(defaultLocation);
    } else {
      setSelectedLocation(userLocation);
    }
  };

  const handleOk = () => {
    if (storeLocation) storeLocation(selectedLocation);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  let clonedCustomButton;
  if (CustomButton) clonedCustomButton = cloneElement(CustomButton, { onClick: showModal });

  return (
    <div>
      {clonedCustomButton ?? (
        <Button
          className="flex flex-col items-center w-min group gap-1 h-[3.5rem] rounded-none p-0 static border-none -mt-3 pt-2"
          shape="circle"
          type="text"
          onClick={showModal}
        >
          <PushpinOutlined className="text-2xl text-gray-600 group-hover:text-gray-900 -mt-[0.4rem]" />
          <span className="text-gray-600 group-hover:text-gray-900">Location</span>
        </Button>
      )}

      <Modal title="Select Location" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {isLoaded ? (
          <GoogleMap
            center={{ lat: selectedLocation[0], lng: selectedLocation[1] }}
            zoom={13}
            mapContainerStyle={{ height: "400px", width: "100%" }}
            onClick={(e) => setSelectedLocation([e.latLng.lat(), e.latLng.lng()])}
          >
            <Marker position={{ lat: selectedLocation[0], lng: selectedLocation[1] }} />
          </GoogleMap>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>
    </div>
  );
};

export default MapModal;

