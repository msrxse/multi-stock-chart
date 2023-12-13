import classes from './welcome.module.css'

export default function Welcome() {
    return (
        <div className={classes.red}>
            <h1>Welcome To App</h1>
            <p>This is going to be the coolest app in the world!</p>
        </div>
    );
}

    