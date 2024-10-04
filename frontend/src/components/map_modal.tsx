import { useEffect, useState, cloneElement, ReactElement } from "react";
import { Modal, Button } from "antd";
import { PushpinOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setSelectedLocation(defaultLocation ?? [latitude, longitude]);
      },
      () => {
        alert("Unable to retrieve your location");
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

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setSelectedLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
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
        <MapContainer
          center={selectedLocation}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={selectedLocation} />
          <MapClickHandler />
        </MapContainer>
      </Modal>
    </div>
  );
};

export default MapModal;
