import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text, Alert, FlatList } from "react-native";

import { colors } from "@/styles/colors";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { Button } from "@/components/button";
import { linksServer } from "@/server/links-server";
import { validateInput } from "@/utils/validateInput";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { participantsServer } from "@/server/participants-server";
import { Participant, ParticipantProps } from "@/components/participant";

type Props = {
  tripid: string;
};

export function Details({ tripId }: { tripId: string }) {
  //MODAL
  const [showNewLinkModal, setShowNewLinkModal] = useState(false);

  //LOADING
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false);

  //LISTS
  const [links, setLinks] = useState<TripLinkProps[]>([]);
  const [participants, setParticipants] = useState<ParticipantProps[]>([]);

  //DATA
  const [linkTitle, setLinkTitle] = useState("");
  const [linkURL, setLinkURL] = useState("");

  function resetNewLinkFields() {
    setLinkTitle("");
    setLinkURL("");
    setShowNewLinkModal(false);
  }

  async function handleCreateLinkTrip() {
    try {
      if (!validateInput.url(linkURL.trim())) {
        return Alert.alert("Link", "Link inválido!");
      }

      if (!linkTitle.trim()) {
        return Alert.alert("Link", "Informe um título para o link");
      }

      setIsCreatingLinkTrip(true);

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkURL,
      });

      Alert.alert("Link", "Link cadastrado com sucesso!");

      resetNewLinkFields();
      await getTripLinks();
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingLinkTrip(false);
    }
  }

  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripId);

      setLinks(links);
    } catch (error) {
      console.log(error);
    }
  }

  async function getTripParticipants() {
    try {
      const participants = await participantsServer.getByTripId(tripId);
      setParticipants(participants);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getTripLinks();
    getTripParticipants();
  }, []);

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links Importantes
      </Text>

      <View className="flex-1">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum link adicionado.
          </Text>
        )}

        <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-44"
        />
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes"
        visible={showNewLinkModal}
        onClose={() => setShowNewLinkModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Input.Field
              placeholder="Título do link"
              onChangeText={setLinkTitle}
            ></Input.Field>
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="URL"
              onChangeText={setLinkURL}
            ></Input.Field>
          </Input>
        </View>

        <Button isLoading={isCreatingLinkTrip} onPress={handleCreateLinkTrip}>
          <Button.Title>Salvar Link</Button.Title>
        </Button>
      </Modal>
    </View>
  );
}
