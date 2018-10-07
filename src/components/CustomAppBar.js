import React from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { drawerWidth } from "./DrawerWithList";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { handleDrawerToggle } from "./DrawerWithList";

const styles = theme => ({
    appBar: {
        position: "absolute",
        marginLeft: drawerWidth,
        [theme.breakpoints.up("md")]: {
            width: `calc(100% - ${drawerWidth}px)`
        }
    },
    navIconHide: {
        [theme.breakpoints.up("md")]: {
            display: "none"
        }
    }
});

class CustomAppBar extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        onClick={handleDrawerToggle}
                        className={classes.navIconHide}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="title"
                        color="inherit"
                        position="relative"
                    >
                        INE5421 - Formal Languages and Compilers
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(CustomAppBar);

import React from "react";
import { withStyles } from "@material-ui/core/styles";
import CustomAppBar from "./CustomAppBar";
import DrawerWithList from "./DrawerWithList";

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        position: "relative",
        display: "flex",
        width: "100%"
    }
});

function myregex() {
    let re = RegExp(
        [
            "^\\s*([A-Z])\\s*->\\s*",
            "(",
            "((&\\s*)|(([a-z]|[0-9])([A-Z])\\s*)|(([a-z]|[0-9])\\s*))",
            "((\\|\\s*&\\s*)|(\\|\\s*(([a-z]|[0-9])([A-Z])\\s*)|(\\|\\s*([a-z]|[0-9])\\s*)))*",
            ")$"
        ].join("")
    );
    console.log(re.test("S -> aA | bB | a | &"));
}

class CustomLayout extends React.Component {
    render() {
        myregex();
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <CustomAppBar />
                <DrawerWithList />
            </div>
        );
    }
}

export default withStyles(styles)(CustomLayout);