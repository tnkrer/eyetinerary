import React, { useState, useMemo, useCallback } from "react";
import BaseContainer from "../../../components/base/baseContainer";
import Sidebar from "../../../components/base/sidebar";
import Main from "../../../components/base/main";
import { apiGet } from "../../../library/common/utils/requests";
import Head from "next/head";
import { connect } from "react-redux";
import { IUser } from "../../../store/user/types";
import { IItinerary } from "../../../library/itinerary/types";
import ItineraryPageList from "../../../components/itinerary/[id]/pageList";
import { IStoreState } from "../../../store/types";
import { useItinerary } from "../../../library/itinerary/common";
import "./index.scss";
import Modal from "../../../components/modal";

interface IProps {
  query: {
    id: string;
    page?: string;
  };
  itinerary?: IItinerary;
  user: IUser;
}

function Itinerary(props: IProps) {
  const [apiError, setApiError] = useState<string>();
  const userToken = props.user.token ? props.user.token : null;
  const itinerary = useItinerary(
    Number(props.query.id),
    props.itinerary,
    userToken,
    setApiError,
  );

  // Computed values
  const pageTitle = useMemo(
    () => `${itinerary ? `${itinerary.title} - ` : ""}Eyetinerary`,
    [itinerary],
  );

  const AddPage = useMemo(() => () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Fields
    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
      [setName],
    );
    const handleDescriptionChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setDescription(e.target.value),
      [setDescription],
    );

    // Buttons
    const handleSave = useCallback(() => {}, [name, description]);
    const handleToggle = useCallback(() => setShowModal(!showModal), [
      showModal,
    ]);

    return (
      <div>
        <input
          className="button button--micro"
          type="button"
          name="add-page"
          value="Add Page"
          onClick={handleToggle}
        />
        <Modal show={showModal} title="Add Page">
          <form className="modal__form">
            <div className="modal__form_elem">
              <label className="title-2" htmlFor="page-name-input">
                Page Name
              </label>
              <input
                id="page-name-input"
                name="page-name"
                type="text"
                placeholder="Day 1: Settling in"
                value={name}
                onChange={handleNameChange}
              />
            </div>
            <div className="modal__form_elem">
              <label className="title-2" htmlFor="page-description-input">
                Page Description
              </label>
              <input
                id="page-description-input"
                name="page-description"
                type="text"
                placeholder="Checking in from the airport"
                value={description}
                onChange={handleDescriptionChange}
              />
            </div>
          </form>
          <div className="modal__buttons">
            <input
              className="button button--wide modal__button"
              name="cancel"
              type="button"
              value="Cancel"
              onClick={handleToggle}
            />
            <input
              className="button button--wide modal__button"
              name="save"
              type="button"
              value="Save"
              onClick={handleSave}
            />
          </div>
        </Modal>
      </div>
    );
  }, []);

  const duration = useMemo(() => {
    // Mock start and end times
    const start = Date.now();
    const end = start.valueOf() + 1000 * 60 * 60 * 24 * 15;
    // Calculate difference
    const difference = end - start;
    const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24)) - weeks * 7;
    // Construct formatted string
    const fmtWeeks = weeks > 0 ? `${weeks} week${weeks > 1 ? "s" : ""}` : "";
    const fmtJoiner = weeks > 0 && days > 0 ? " and " : "";
    const fmtDays =
      days > 0 || weeks < 1 ? `${days} day${days > 1 ? "s" : ""}` : "";
    return `${fmtWeeks}${fmtJoiner}${fmtDays}`;
  }, [
    /* time start, time end, etc.*/
  ]);

  return (
    <BaseContainer>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {itinerary && (
        <div className="itinerary">
          <header className="itinerary__header">
            <h1 className="title">{itinerary.title}</h1>
            {itinerary.description && (
              <div className="sub-title">itinerary description</div>
            )}
            <div className="itinerary__info">
              <div className="itinerary__info_item">
                <span>Destination: </span>
                <span>Bangkok, Thailand</span>
              </div>
              <div className="itinerary__info_item">
                <span>Duration: </span>
                <span>{duration}</span>
              </div>
            </div>
          </header>
          <div className="itinerary__main">
            <div className="itinerary__main_heading">
              <h2 className="title-2">Pages</h2>
              <AddPage />
            </div>
            {itinerary.pages && itinerary.pages.length > 0 && (
              <ItineraryPageList itinerary={itinerary} />
            )}
          </div>
        </div>
      )}
    </BaseContainer>
  );
}

Itinerary.getInitialProps = async ({ query }) => {
  const props = { query, itinerary: null };
  const response = await apiGet(`/itinerary/${query.id}`);
  if (response.success) {
    props.itinerary = response.body;
  }
  return props;
};

const mapStateToProps = (state: IStoreState) => ({
  user: state.user,
});

export default connect(mapStateToProps)(Itinerary);
