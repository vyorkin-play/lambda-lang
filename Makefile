start:
	npm start

clean:
	npm run clean

lint:
	npm run lint --silent

check:
	flow

build:
	npm run clean
	npm run build

test:
	npm test

.PHONY: start clean lint check test build
