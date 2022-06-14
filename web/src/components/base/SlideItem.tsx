import { useTheme, Slide, SlideProps } from '@mui/material';

const SlideItem = ( props: SlideProps ) => {
    const theme = useTheme();
    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    };

    return (
        <Slide
            appear={props.appear}
            in={props.in}
            timeout={transitionDuration}
            style={{
                transitionDelay: `${props.in ? 0 : transitionDuration.exit*2/3}ms`,
            }}
            container={props.container}
            direction={props.direction}
            unmountOnExit
        >
            {props.children}
        </Slide>
    );
}

export default SlideItem;