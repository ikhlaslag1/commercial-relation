import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "./MDBox";
import MDTypography from "./MDTypography";

function ComplexStatisticsCard({ color, title, count, IconComponent }) {
  return (
    <Card sx={{ width: 170, height: 90, position: "relative", padding: 2 }}>
      <MDBox
        variant="gradient"
        bgColor={color}
        color="white"
        borderRadius="50%"
        shadow="lg"
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="2.5rem"
        height="2.5rem"
        position="absolute"
        top={8}
        left={15}
      >
        <IconComponent fontSize="small" />
      </MDBox>
      <MDBox
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-end"
        height="100%"
      >
        <MDTypography variant="button" fontWeight="light" color="text">
          {title}
        </MDTypography>
        <MDTypography variant="h4">{count}</MDTypography>
      </MDBox>
    </Card>
  );
}

ComplexStatisticsCard.propTypes = {
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  IconComponent: PropTypes.elementType.isRequired,
};

export default ComplexStatisticsCard;
