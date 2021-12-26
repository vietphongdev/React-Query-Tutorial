const { useState } = require("react");

const useProcessInterval = ({ onSuccess, onError }) => {
  const [processId, setProcessId] = useState(null);
  const [stop, setStop] = useState(false);

  // Mutation to start the process
  const { mutate } = useMutation(startProcess, {
    onMutate: () => {
      setStop(false);
    },
    onError: (error) => {
      console.error(error);
      setStop(true);
      onError();
    },
    onSuccess: (data) => {
      setProcessId(data.process_id);
    },
  });

  //Fetch until received status is finished
  const { isLoading, data } = useQuery(
    ["processProgress", processId],
    getProgress,
    {
      onSuccess: (data) => {
        if (data.status === "finished") {
          setStop(true);
          setProcessId(null);
          onSuccess();
        }
      },
      onError: (error) => {
        console.error(error);
        setStop(true);
        setProcessId(null);
        onError();
      },
      enabled: processId != null,
      refetchInterval: stop ? false : 5000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    }
  );

  return { mutate, data, isLoading };
};

/** How to use it */
const { mutate, data, isLoading } = useProcessInterval({
  onSuccess: () => console.log("Process finished"),
  onError: () => console.log("Error with process"),
});
