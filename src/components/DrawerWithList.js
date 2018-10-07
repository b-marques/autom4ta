import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import Toolbar from "@material-ui/core/Toolbar";

import logo from "../logo.svg";

export const drawerWidth = 240;

const styles = theme => ({
    drawerPaper: {
        width: drawerWidth,
        [theme.breakpoints.up("md")]: {
            position: "relative"
        }
    },
    toolbar: theme.mixins.toolbar,
    button: {
        margin: theme.spacing.unit
    },
    logo: {
        width: "100%"
    },
    extendedIcon: {
        marginRight: theme.spacing.unit
    }
});

export function handleDrawerToggle() {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
}

class DrawerWithList extends React.Component {
    state = {
        mobileOpen: false
    };

    render() {
        const { classes, theme } = this.props;
        const list = (
            <div align="center">
                <Button
                    variant="extendedFab"
                    color="primary"
                    aria-label="Add"
                    className={classes.button}
                >
                    <AddIcon className={classes.extendedIcon} />
                    New Language
                </Button>
            </div>
        );
        return (
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
                <Toolbar>
                    <img className={classes.logo} src={logo} alt="logo" />
                </Toolbar>
                <Divider />
                {list}
            </Drawer>
        );
    }
}

export default withStyles(styles, { withTheme: true })(DrawerWithList);
