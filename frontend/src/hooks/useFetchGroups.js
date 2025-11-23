import { useCallback, useEffect, useMemo, useState } from "react";
import multicallAbi from "../constants/multicallabi.json";
import { useAppKitNetwork } from "@reown/appkit/react";
import ABI from "../constants/groupthriftAbi.json";
import { useThriftData } from "../context/ThriftContextProvider";
import useSignerOrProvider from "./useSignerOrProvider";
import { Contract, Interface } from "ethers";

const useFetchGroups = () => {
  const { allGroup, groupUser } = useThriftData(); 
  const { chainId } = useAppKitNetwork();
  const { readOnlyProvider } = useSignerOrProvider();
  const [groupThriftAll, setGroupThriftAll] = useState([]);
  const [groupThriftUser, setGroupThriftUser] = useState([]);
  const [loading, setLoading] = useState(false)

  const itf = useMemo(() => new Interface(ABI), []);
  const multicallAddr = import.meta.env.VITE_MULTICALL2_ADDRESS;

  const normalizeAddresses = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return [...input];
    return Object.values(input).filter((v) => typeof v === "string");
  };

  const decodeThrift = (res) => {
    // `res` from multicall may be an array-like Proxy where
    // - res[0] is a boolean success flag
    // - res[1] is the returned hex data
    // or it may expose a `returnData` property depending on provider/runtime.
    // Handle both shapes defensively and return null when decoding fails so
    // the caller can skip that entry.
    try {
      // Safe property accessor for Proxy-like multicall results
      const safeGet = (obj, key) => {
        try {
          if (obj == null) return undefined;
          return obj[key];
        } catch (e) {
          console.warn(`Deferred multicall property access failed for key ${String(key)}`, e);
          return undefined;
        }
      };

      // some providers return [success, returnData]
      const successFlag = safeGet(res, 0);
      const success = typeof successFlag === "undefined" ? true : !!successFlag;

      if (!success) {
        console.warn("Multicall call failed for a target, skipping");
        return null;
      }

      const returnData = safeGet(res, "returnData") ?? safeGet(res, 1) ?? safeGet(res, "returnData");
      if (!returnData) {
        console.warn("No returnData on multicall result, skipping");
        return null;
      }

      let raw;
      try {
        raw = itf.decodeFunctionResult("getGroupGoal", returnData)[0];
      } catch (err) {
        console.error("ABI decode failed for getGroupGoal:", err, String(returnData).slice(0, 200));
        return null;
      }

      // Some providers return proxy objects that lazily decode when indexed.
      // Access indices defensively so a bad/missing index doesn't throw out of this function.
      const safeAt = (obj, i) => {
        try {
          return obj[i];
        } catch (e) {
          console.warn(`Deferred ABI decoding failed at index ${i}:`, e);
          return undefined;
        }
      };

      const a0 = safeAt(raw, 0);
      const a1 = safeAt(raw, 1);
      const a2 = safeAt(raw, 2);
      const a3 = safeAt(raw, 3);
      const a4 = safeAt(raw, 4);
      const a5 = safeAt(raw, 5);
      const a6 = safeAt(raw, 6);
      const a7 = safeAt(raw, 7);
      const a8 = safeAt(raw, 8);
      const a9 = safeAt(raw, 9);
      const a10 = safeAt(raw, 10);
      const a11 = safeAt(raw, 11);
      const a12 = safeAt(raw, 12);
      const a13 = safeAt(raw, 13);

      // If critical fields are missing, skip this entry
      if (a0 === undefined || a2 === undefined || a4 === undefined) {
        console.error("Decoded group goal missing critical fields, skipping", { a0, a2, a4 });
        return null;
      }

      return {
        creator: a0,
        currency: a1,
        goalId: Number(a2),
        title: a3,
        goal: a4 ? a4.toString() : "0",
        saved: a5 ? a5.toString() : "0",
        amountPerPeriod: a6 ? a6.toString() : "0",
        isClosed: a7,
        startDate: a8 !== undefined ? Number(a8) : 0,
        endDate: a9 !== undefined ? Number(a9) : 0,
        lastsaved: a10 !== undefined ? Number(a10) : 0,
        totalMember: a11 !== undefined ? Number(a11) : 0,
        memberAddress: a12,
        frequency: a13 !== undefined ? Number(a13) : 0,
      };
    } catch (err) {
      console.error("decodeThrift unexpected error:", err, res);
      return null;
    }
  };

  const fetchGroup = useCallback(async () => {
    if (!chainId || !readOnlyProvider) return;

    setLoading(true)

    const multicallContract = new Contract(
      multicallAddr,
      multicallAbi,
      readOnlyProvider
    );

    const normalizedAllGroup = normalizeAddresses(allGroup);
    const normalizedGroupUser = normalizeAddresses(groupUser);

    const allGroupCalls = normalizedAllGroup.map((addr) => ({
      target: addr,
      callData: itf.encodeFunctionData("getGroupGoal"),
    }));

    const groupUserCalls = normalizedGroupUser.map((addr) => ({
      target: addr,
      callData: itf.encodeFunctionData("getGroupGoal"),
    }));

    try {
      const [resultAll, resultUser] = await Promise.all([
        multicallContract.tryAggregate.staticCall(true, allGroupCalls),
        multicallContract.tryAggregate.staticCall(true, groupUserCalls),
      ]);

      // log a compact, serializable summary (large Proxy objects in devtools are hard to read)
      console.log("Group fetch results:", {
        allCount: resultAll.length,
        userCount: resultUser.length,
      });

      // decode results, skipping any failed/undecodable entries
      const decodedAll = resultAll
        .map((res, i) => {
          try {
            const decoded = decodeThrift(res);
            if (!decoded) return null;
            return {
              ...decoded,
              address: normalizedAllGroup[i],
            };
          } catch (err) {
            console.error("Failed to decode allGroup entry", { index: i, address: normalizedAllGroup[i], err });
            return null;
          }
        })
        .filter(Boolean);

      const decodedUser = resultUser
        .map((res, i) => {
          try {
            const decoded = decodeThrift(res);
            if (!decoded) return null;
            return {
              ...decoded,
              address: normalizedGroupUser[i],
            };
          } catch (err) {
            console.error("Failed to decode groupUser entry", { index: i, address: normalizedGroupUser[i], err });
            return null;
          }
        })
        .filter(Boolean);

      setGroupThriftAll(decodedAll);
      setGroupThriftUser(decodedUser);
    } catch (error) {
      console.error("Failed to fetch individual thrifts:", error);
    } finally {
      setLoading(false)
    }
  }, [allGroup, groupUser, itf, multicallAddr, readOnlyProvider, chainId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  return {
    groupThriftAll,
    groupThriftUser,
    loading
  };
};

export default useFetchGroups;