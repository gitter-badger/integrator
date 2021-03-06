import parseArgs from 'minimist';
import utils from './utils';

const args = parseArgs(process.argv);

if (!args.suite) {
    throw new Error('No suite supplied. Use --suite');
}

const start = args => suite => {
    return suite(args)
        .reduce((pPrev, {name, test}) => pPrev.then((x) =>
            // Double nested so that the catch only catches for the promise it's
            // directly attached to.
            Promise.resolve(x)
                .then(test)
                .catch(why => {
                    why.name = name;
                    why.test = test;
                    throw why;
                })),
            Promise.resolve(args)
        );
};

System.import(args.suite)
    .then(res => res.default)
    .then(start(args))
    .catch(why => {
        console.error(`Failed: ${why.name}`);
        console.error(why.stack);
        process.exit(-1); // eslint-disable-line no-process-exit
    });
