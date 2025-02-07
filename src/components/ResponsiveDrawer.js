import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import logo from "../logo.svg";
import { withStyles } from "@material-ui/core/styles";

import AddLanguage from "../containers/AddLanguage";
import RemoveLanguage from "../containers/RemoveLanguage";
import { selectLanguage } from "../actions";

import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Divider from "@material-ui/core/Divider";
import MenuIcon from "@material-ui/icons/Menu";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import LanguageList from "../containers/LanguageList";

const drawerWidth = 240;

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: "100%",
        zIndex: 1,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        width: "100%"
    },
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
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
        height: "100vh",
        [theme.breakpoints.up("md")]: {
            position: "relative"
        }
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3
    },
    listItem: {
        "&:focus": {
            backgroundColor: "#eb7f00",
            "& $primary, & $icon": {
                color: theme.palette.common.white
            }
        }
    }
});

class ResponsiveDrawer extends React.Component {
    state = {
        mobileOpen: false
    };

    handleDrawerToggle = () => {
        this.setState(state => ({ mobileOpen: !state.mobileOpen }));
    };

    render() {
        const { classes, theme } = this.props;

        const drawer = (
            <div>
                <Toolbar>
                    <img src={logo} alt="logo" width="100%" />
                </Toolbar>
                <Divider />
                <div className="language-list-cotainer">
                    <List component="nav" className={classes.listItem}>
                        {this.props.reducer.languages.map((language, id) => {
                            return (
                                <ListItem
                                    className={classes.listItem}
                                    button
                                    selected={id === this.props.reducer.selected_language}
                                    key={id}
                                    onClick={e => {
                                        e.preventDefault();
                                        this.props.selectLanguage(id);
                                    }}
                                >
                                    <Typography noWrap color="inherit">
                                        {" ID: " + id + "  -  " + language.name}
                                    </Typography>
                                </ListItem>
                            );
                        })}
                    </List>
                </div>

                <AddLanguage />
                <RemoveLanguage />
                <Toolbar />
            </div>
        );

        return (
            <div className={classes.root}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={this.handleDrawerToggle}
                            className={classes.navIconHide}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="title" color="inherit" noWrap>
                            INE5421 - Linguagens Formais e Compiladores
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Hidden mdUp>
                    <Drawer
                        variant="temporary"
                        anchor={theme.direction === "rtl" ? "right" : "left"}
                        open={this.state.mobileOpen}
                        onClose={this.handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper
                        }}
                        ModalProps={{
                            keepMounted: true // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden smDown implementation="css">
                    <Drawer
                        variant="permanent"
                        open
                        classes={{
                            paper: classes.drawerPaper
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <LanguageList />
                </main>
            </div>
        );
    }
}

ResponsiveDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
};

const mapStateToProps = state => ({ reducer: state.languageReducer });

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            selectLanguage
        },
        dispatch
    );
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(ResponsiveDrawer));
