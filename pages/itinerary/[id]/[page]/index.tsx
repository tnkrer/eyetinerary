import { useMemo, useState } from "react";
import { connect } from "react-redux";
import { apiGet } from "../../../../common/utils/requests";
import BaseContainer from "../../../../components/base/baseContainer";
import Sidebar from "../../../../components/base/sidebar";
import Main from "../../../../components/base/main";
import { IStoreState } from "../../../../store/types";
import { IUser } from "../../../../store/user/types";
import { IItinerary, IPage } from "../../types";
import { useItinerary, sortPages } from "../common";

interface IProps {
  query: {
    id: string;
    page: string;
  };
  itinerary: IItinerary;
  user: IUser;
}

function ItineraryPage(props: IProps) {
  const [apiError, setApiError] = useState<string>();
  const userToken = props.user.token ? props.user.token : null;
  const itinerary = useItinerary(
    Number(props.query.id),
    props.itinerary,
    userToken,
    setApiError,
  );

  // Computed values
  const page = useMemo<IPage>(() => {
    if (itinerary) {
      const sortedPages = sortPages(itinerary.pages);
      return sortedPages[Number(props.query.page) - 1];
    }
  }, [itinerary]);

  return (
    <BaseContainer>
      <Sidebar />
      <Main>
        {page && (
          <header>
            <h1 className="title">{page.title}</h1>
          </header>
        )}
      </Main>
    </BaseContainer>
  );
}

ItineraryPage.getInitialProps = async ({ query }) => {
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

export default connect(mapStateToProps)(ItineraryPage);